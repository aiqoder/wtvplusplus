package stream

import (
	"fmt"
	"net"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Server struct {
	listener net.Listener
	server   *http.Server
	mu       sync.RWMutex
	clients  map[*websocket.Conn]struct{}
}

func New() (*Server, error) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, err
	}
	s := &Server{listener: listener, clients: make(map[*websocket.Conn]struct{})}
	mux := http.NewServeMux()
	mux.HandleFunc("/", s.handle)
	s.server = &http.Server{Handler: mux}
	go s.server.Serve(listener)
	return s, nil
}

func (s *Server) Port() int {
	return s.listener.Addr().(*net.TCPAddr).Port
}

func (s *Server) Write(data []byte) (int, error) {
	s.mu.Lock()
	for client := range s.clients {
		if err := client.WriteMessage(websocket.BinaryMessage, data); err != nil {
			s.mu.Unlock()
			return 0, err
		}
	}
	s.mu.Unlock()
	return len(data), nil
}

func (s *Server) Close() error {
	s.mu.Lock()
	for client := range s.clients {
		client.Close()
	}
	s.clients = map[*websocket.Conn]struct{}{}
	s.mu.Unlock()
	return s.server.Close()
}

func (s *Server) handle(writer http.ResponseWriter, request *http.Request) {
	upgrader := websocket.Upgrader{CheckOrigin: func(*http.Request) bool { return true }}
	client, err := upgrader.Upgrade(writer, request, nil)
	if err != nil {
		return
	}
	s.mu.Lock()
	s.clients[client] = struct{}{}
	s.mu.Unlock()
	defer func() {
		s.mu.Lock()
		delete(s.clients, client)
		s.mu.Unlock()
		client.Close()
	}()
	for {
		if _, _, err := client.ReadMessage(); err != nil {
			return
		}
	}
}

func (s *Server) URL() string {
	return fmt.Sprintf("ws://127.0.0.1:%d", s.Port())
}
