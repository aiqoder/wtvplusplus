//go:build cgo && (darwin || linux || windows)

#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "libavformat/avformat.h"
#include "libavcodec/avcodec.h"
#include "libavutil/avutil.h"
#include "libavutil/pixdesc.h"

typedef int (*wtv_write_cb)(uintptr_t user, uint8_t *buf, int buf_size);

typedef struct {
	wtv_write_cb write;
	uintptr_t user;
} wtv_io;

static double ratio_to_double(AVRational value) {
	return value.den == 0 ? 0 : (double)value.num / (double)value.den;
}

static int interrupt_callback(void *opaque) {
	return *(int *)opaque ? 1 : 0;
}

void wtv_cancel(int *cancelled) {
	*cancelled = 1;
}

char *wtv_probe(const char *url, int *cancelled) {
	AVFormatContext *format = avformat_alloc_context();
	if (!format) return NULL;
	format->interrupt_callback.callback = interrupt_callback;
	format->interrupt_callback.opaque = cancelled;
	if (avformat_open_input(&format, url, NULL, NULL) < 0) return NULL;
	if (avformat_find_stream_info(format, NULL) < 0) {
		avformat_close_input(&format);
		return NULL;
	}

	size_t capacity = 4096 + format->nb_streams * 512;
	char *output = calloc(1, capacity);
	if (!output) {
		avformat_close_input(&format);
		return NULL;
	}

	int offset = snprintf(
		output,
		capacity,
		"{\"formatName\":\"%s\",\"duration\":%.3f,\"bitrate\":%lld,\"streams\":[",
		format->iformat ? format->iformat->name : "",
		format->duration == AV_NOPTS_VALUE ? 0.0 : (double)format->duration / AV_TIME_BASE,
		(long long)format->bit_rate);
	for (unsigned int i = 0; i < format->nb_streams; i++) {
		AVStream *stream = format->streams[i];
		AVCodecParameters *codec = stream->codecpar;
		if (i > 0) output[offset++] = ',';
		offset += snprintf(
			output + offset,
			capacity - offset,
			"{\"index\":%d,\"codecName\":\"%s\",\"codecType\":\"%s\",\"width\":%d,\"height\":%d,\"frameRate\":%.3f,\"pixelFormat\":\"%s\"}",
			stream->index,
			avcodec_get_name(codec->codec_id),
			av_get_media_type_string(codec->codec_type),
			codec->width,
			codec->height,
			ratio_to_double(stream->avg_frame_rate.num ? stream->avg_frame_rate : stream->r_frame_rate),
			av_get_pix_fmt_name(codec->format));
	}
	snprintf(output + offset, capacity - offset, "]}");
	avformat_close_input(&format);
	return output;
}

const char *wtv_version(void) {
	return av_version_info();
}

static int write_packet(void *opaque, uint8_t *buffer, int buffer_size) {
	wtv_io *io = (wtv_io *)opaque;
	return io->write(io->user, buffer, buffer_size);
}

int wtv_remux(const char *url, wtv_write_cb write_cb, uintptr_t user, int *cancelled) {
	AVFormatContext *input = NULL;
	AVFormatContext *output = NULL;
	AVIOContext *avio = NULL;
	wtv_io io = {write_cb, user};

	/* interrupt must be set before open so HLS/HTTP nested I/O can abort */
	input = avformat_alloc_context();
	if (!input) return -1;
	input->interrupt_callback.callback = interrupt_callback;
	input->interrupt_callback.opaque = cancelled;
	if (avformat_open_input(&input, url, NULL, NULL) < 0) {
		/* On failure FFmpeg frees a user-supplied context. */
		return -1;
	}
	if (*cancelled) goto fail;
	if (avformat_find_stream_info(input, NULL) < 0) goto fail;
	if (*cancelled) goto fail;
	if (avformat_alloc_output_context2(&output, NULL, "mpegts", NULL) < 0 || !output) goto fail;

	for (unsigned int i = 0; i < input->nb_streams; i++) {
		AVStream *stream = avformat_new_stream(output, NULL);
		if (!stream || avcodec_parameters_copy(stream->codecpar, input->streams[i]->codecpar) < 0) goto fail;
		stream->time_base = input->streams[i]->time_base;
	}

	unsigned char *buffer = av_malloc(32 * 1024);
	avio = avio_alloc_context(buffer, 32 * 1024, 1, &io, NULL, write_packet, NULL);
	if (!avio) goto fail;
	output->pb = avio;
	output->flags |= AVFMT_FLAG_CUSTOM_IO;
	if (avformat_write_header(output, NULL) < 0) goto fail;

	AVPacket *packet = av_packet_alloc();
	if (!packet) goto fail;
	while (av_read_frame(input, packet) >= 0) {
		if (*cancelled) {
			av_packet_unref(packet);
			av_packet_free(&packet);
			goto fail;
		}
		packet->pts = av_rescale_q_rnd(
			packet->pts,
			input->streams[packet->stream_index]->time_base,
			output->streams[packet->stream_index]->time_base,
			AV_ROUND_NEAR_INF | AV_ROUND_PASS_MINMAX);
		packet->dts = av_rescale_q_rnd(
			packet->dts,
			input->streams[packet->stream_index]->time_base,
			output->streams[packet->stream_index]->time_base,
			AV_ROUND_NEAR_INF | AV_ROUND_PASS_MINMAX);
		packet->duration = av_rescale_q(
			packet->duration,
			input->streams[packet->stream_index]->time_base,
			output->streams[packet->stream_index]->time_base);
		if (av_interleaved_write_frame(output, packet) < 0) {
			av_packet_unref(packet);
			av_packet_free(&packet);
			goto fail;
		}
		av_packet_unref(packet);
	}
	av_packet_free(&packet);
	if (*cancelled) goto fail;
	av_write_trailer(output);
	avio_context_free(&avio);
	avformat_free_context(output);
	avformat_close_input(&input);
	return 0;

fail:
	if (avio) avio_context_free(&avio);
	if (output) avformat_free_context(output);
	if (input) avformat_close_input(&input);
	return -1;
}
