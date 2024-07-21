import os from "os"

export function getIp() {
    const iptable = {},
        ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        (ifaces[dev] || []).forEach(function (details, alias) {
            if (['IPv4','IPv6'].includes(details.family) && !details.internal) {
                iptable[dev + (alias ? ':' + alias : '')] = details.address;
            }
        });
    }
    return iptable
}