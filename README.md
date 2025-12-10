# Instalasi dcm4che + OHIF Viewer dengan Basic Auth

Setup dcm4che, dan OHIF Viewer di Ubuntu Server 24.04 dengan basic authentication via NGINX.

## Requirement

- OS: Ubuntu Server 24.04 LTS
- Docker Engine 24.0+
- Docker Compose 2.0+
- Hardware: CPU 2 core, RAM 4GB, Storage 20GB

---

## Spesifikasi yang Akan Diinstall

| Komponen | Versi | Fungsi |
|----------|-------|--------|
| DCM4CHEE Archive | 5.34.1 | PACS Archive Server |
| OHIF Viewer | latest | Medical Image Viewer |
| PostgreSQL | 17.4 | Database |
| LDAP (slapd) | 2.6.8 | Directory Server |
| NGINX | latest | Reverse Proxy & Basic Auth |
| Portainer | latest | Container Management |

---

## Preview Hasil Instalasi

### DCM4CHEE UI (Web Interface)
![DCM4CHEE UI Preview](images/dcm4chee-ui-preview.png)

### OHIF Viewer 3.11.1
![OHIF Viewer Preview](images/ohif-viewer-preview.png)


---

## 1. Instalasi Docker

### 1.1 Hapus Docker Lama

```bash
sudo apt remove $(dpkg --get-selections docker.io docker-compose docker-compose-v2 docker-doc podman-docker containerd runc | cut -f1)
```

### 1.2 Setup Repository Docker

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

### 1.3 Install Docker

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

---

## 2. Download Repository

```bash
cd /opt
sudo git clone https://github.com/krisnadwiki/dcm4che-ohif3.git
cd dcm4che-ohif3
```

---

## 3. Struktur Folder

```
dcm4che-ohif3/
├── docker-compose.yml
├── .env
├── images/
│   ├── dcm4chee-ui-preview.png
│   ├── ohif-viewer-preview.png
├── nginx/
│   ├── nginx.conf
│   ├── htpasswd
│   └── certs/
├── ohif/
│   ├── app-config.js
│   └── logo.png
└── README.md
```

---

## 4. Konfigurasi

### 4.1 File `.env`

Edit `.env` sesuai IP server Anda:

```bash
DOCKER_HOST=192.168.12.44
PACS_DB_PASSWORD=pacs
```

**Update IP dari command line:**

Ganti IP `192.168.100.50` dengan IP server Anda:

```bash
sudo sed -i 's/192.168.12.44/192.168.100.50/g' .env
```

Verifikasi perubahan:

```bash
cat .env
```

### 4.2 File `nginx/htpasswd` - Basic Authentication

Default: `admin:admin123` (hash: `$apr1$kH8v4h4k$o8Bwonv9pSGaIPim47j4Z1`)

**Cara mudah - gunakan script:**

```bash
sudo chmod +x update-htpasswd.sh
sudo ./update-htpasswd.sh
```

Script ini akan:
- Pilih opsi: buat/update user, tambah user, atau lihat user
- Input username dan password (dengan konfirmasi)
- Generate hash otomatis
- Update file htpasswd
- Restart nginx secara otomatis

**Atau manual dengan nano:**

```bash
sudo nano nginx/htpasswd
```

Edit dan ganti password hash, simpan dengan Ctrl+X → Y → Enter.

### 4.3 File `nginx/nginx.conf`

Sudah dikonfigurasi dengan:
- **Port 3571**: Akses internal OHIF Viewer tanpa auth (VLAN lokal)
- **Port 80**: HTTP dengan basic auth
- **Port 443**: HTTPS dengan basic auth

Tidak perlu diubah.

### 4.4 Timezone Configuration

Semua container sudah dikonfigurasi menggunakan timezone **Asia/Jakarta (WIB, UTC+7)**.

**Verifikasi timezone di host server:**

```bash
timedatectl
```

**Jika berbeda, set timezone server:**

```bash
sudo timedatectl set-timezone Asia/Jakarta
```

**Timezone di container:**
- Environment variable `TZ=Asia/Jakarta` untuk semua container
- Java/Wildfly: `JAVA_OPTS: -Duser.timezone=Asia/Jakarta`
- PostgreSQL: `PGTZ=Asia/Jakarta`

**Ganti timezone (opsional):**

Edit file `.env` atau `docker-compose.yml`, ganti semua `Asia/Jakarta` dengan timezone lain, contoh:
- `Asia/Makassar` (WITA, UTC+8)
- `Asia/Jayapura` (WIT, UTC+9)
- `UTC` (UTC+0)

### 4.5 Custom File `ohif/app-config.js` - [Opsional]

**Custom logo dan nama aplikasi (opsional):**

```javascript
whiteLabeling: {
  createLogoComponentFn: function(React) {
    return React.createElement(
      'div',
      {
        className: 'header-brand',
        style: {
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        },
        onClick: function(e) {
          e.preventDefault();
          if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        }
      },
      [
        React.createElement('div', {
          key: 'logo',
          style: {
            background: 'url(/logo.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            width: '30px',
            height: '30px',
            marginRight: '12px',
          },
        }),
        React.createElement('span', {
          key: 'text',
          style: {
            color: 'white',
            fontSize: '20px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
          },
        }, 'OHIF - Hospital Name')
      ]
    );
  },
},
```

Letakkan `logo.png` di folder `ohif/`.

---

## 5. Firewall

### UFW (Ubuntu/Debian)

```bash
sudo ufw allow 80/tcp     # HTTP (OHIF dengan login)
sudo ufw allow 443/tcp    # HTTPS (OHIF dengan login)
sudo ufw allow 3571/tcp   # OHIF tanpa login
sudo ufw allow 8080/tcp   # HTTP DCM4CHEE Web Interface & Management
sudo ufw allow 9000/tcp   # Portainer
sudo ufw allow 11112/tcp  # DICOM Connections (Modalities)
sudo ufw allow 2575/tcp   # HL7 Receiver
sudo ufw enable
```

---

## 6. Jalankan Container

```bash
cd /opt/dcm4che-ohif3
sudo docker compose pull
sudo docker compose up -d
sudo docker ps
```

**Container yang aktif:**
- `ldap` - LDAP Server
- `postgres` - Database
- `dcm4chee-arc` - PACS Archive
- `ohif-viewer` - Viewer
- `nginx` - Reverse Proxy
- `portainer` - Management

---

## 7. Akses Layanan

| Layanan | URL | Auth | Akses |
|---------|-----|------|-------|
| OHIF Viewer (dengan Login) | `http://SERVER_IP/` | Basic Auth | Public |
| OHIF Viewer (tanpa Login) | `http://SERVER_IP:3571/` | Tidak | VLAN Lokal |
| DCM4CHEE UI | `http://SERVER_IP:8080/dcm4chee-arc/ui2` | Tidak | VLAN Lokal |
| DICOM Service | `SERVER_IP:11112` | Protocol DICOM | Network |
| Portainer | `http://SERVER_IP:9000` | - | Lokal |

**Contoh (IP `192.168.12.44`):**

```
OHIF Viewer (dengan Login):
http://192.168.12.44/
Username: admin
Password: admin123

OHIF Viewer (tanpa Login - VLAN):
http://192.168.12.44:3571/

DCM4CHEE UI (VLAN):
http://192.168.12.44:8080/dcm4chee-arc/ui2
```

---

## 8. Troubleshooting

### Container tidak berjalan setelah restart server

Jika container tidak auto-start setelah server restart:

```bash
# Cek status container
sudo docker ps -a

# Restart container yang exit
sudo docker compose restart

# Atau restart semua container
sudo docker compose down
sudo docker compose up -d
```

**Penyebab umum:**
- Dependencies belum siap saat container start
- Healthcheck timeout terlalu pendek
- Resource limit (CPU/RAM) tidak cukup

**Solusi permanent:**
- Docker Compose sudah dikonfigurasi dengan `restart: unless-stopped`
- Healthcheck memastikan dependencies ready sebelum start
- `depends_on` dengan `condition: service_healthy` untuk urutan startup

**Urutan startup container:**
1. `ldap` + `db` (base services)
2. `arc` (menunggu ldap & db healthy)
3. `ohif` (menunggu arc healthy)
4. `nginx` (menunggu ohif & arc healthy)
5. `portainer` (independent)

### Container tidak berjalan

```bash
sudo docker ps -a
sudo docker compose logs
sudo docker compose restart
```

### Tidak bisa akses OHIF

```bash
curl -u admin:admin123 http://localhost/
curl http://localhost:8080/
nc -zv localhost 11112
```

### Basic auth tidak bekerja

```bash
cat nginx/htpasswd
openssl passwd -apr1
echo "admin:hash_baru" > nginx/htpasswd
sudo docker compose restart nginx
```

### Sertifikat HTTPS error

```bash
mkdir -p nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/privkey.pem \
  -out nginx/certs/fullchain.pem
sudo docker compose restart nginx
```

### Timezone tidak sesuai

Jika waktu di container tidak sesuai dengan server:

```bash
# Cek timezone server
timedatectl

# Set timezone server
sudo timedatectl set-timezone Asia/Jakarta

# Restart container untuk apply timezone
sudo docker compose restart

# Verifikasi timezone di container
sudo docker exec postgres date
sudo docker exec dcm4chee-arc date

# Verifikasi Java timezone
sudo docker exec dcm4chee-arc bash -c 'echo $TZ'
```

**Catatan:** Timezone dikonfigurasi via environment variable `TZ` di docker-compose.yml

---

## 9. Update & Maintenance

### 9.1 Start/Stop Container

**Start container (pertama kali):**

```bash
cd /opt/dcm4che-ohif3
sudo docker compose pull
sudo docker compose up -d
```

Output:
```
[+] Building 0.0s (0/0)
[+] Running 7/7
 ✔ Container ldap         Healthy                                          5.5s
 ✔ Container postgres     Healthy                                          5.0s
 ✔ Container dcm4chee-arc Healthy                                         16.6s
 ✔ Container ohif-viewer  Healthy                                          5.5s
 ✔ Container nginx        Healthy                                          3.2s
 ✔ Container portainer    Running                                          1.3s
```

Verifikasi status container:

```bash
sudo docker compose ps
```

**Stop semua container (tanpa delete):**

```bash
sudo docker compose stop
```

Output:
```
[+] Stopping 7/7
 ✔ Container dcm4chee-arc Stopped                                          2.2s
 ✔ Container nginx        Stopped                                          1.4s
 ✔ Container ohif-viewer  Stopped                                          0.8s
 ✔ Container portainer    Stopped                                          1.3s
 ✔ Container postgres     Stopped                                          1.3s
 ✔ Container ldap         Stopped                                          1.3s
```

**Start kembali semua container:**

```bash
sudo docker compose start
```

Output:
```
[+] Starting 6/6
 ✔ Container ldap         Started                                          0.5s
 ✔ Container postgres     Started                                          1.2s
 ✔ Container dcm4chee-arc Started                                          2.5s
 ✔ Container ohif-viewer  Started                                          1.5s
 ✔ Container nginx        Started                                          1.2s
 ✔ Container portainer    Started                                          0.8s
```

**Stop dan delete semua container + network (keep volumes & data):**

```bash
sudo docker compose down
```

Output:
```
[+] Running 7/7
 ✔ Container nginx              Removed                                    1.4s
 ✔ Container ohif-viewer        Removed                                    0.8s
 ✔ Container dcm4chee-arc       Removed                                    2.2s
 ✔ Container portainer          Removed                                    1.3s
 ✔ Container postgres           Removed                                    1.3s
 ✔ Container ldap               Removed                                    1.3s
 ✔ Network dcm4che-ohif_default Removed                                    0.2s
```

**Catatan:** Volume data di `/var/local/dcm4chee-arc/` tetap tersimpan, sehingga data tidak hilang.

### 9.2 Container Restart

**Restart satu container:**

```bash
sudo docker compose restart arc
```

Output:
```
[+] Restarting 1/1
 ✔ Container dcm4chee-arc Restarted                                        5.2s
```

**Restart container tertentu:**

```bash
sudo docker compose restart db
sudo docker compose restart nginx
sudo docker compose restart ohif
```

**Restart semua container:**

```bash
sudo docker compose restart
```

Output:
```
[+] Restarting 6/6
 ✔ Container ldap         Restarted                                        1.2s
 ✔ Container postgres     Restarted                                        2.5s
 ✔ Container dcm4chee-arc Restarted                                        8.3s
 ✔ Container ohif-viewer  Restarted                                        2.1s
 ✔ Container nginx        Restarted                                        1.5s
 ✔ Container portainer    Restarted                                        1.0s
```

### 9.3 Lihat Log & Status

**Status semua container:**

```bash
sudo docker compose ps
```

Output:
```
NAME            IMAGE                                COMMAND                  SERVICE         STATUS              PORTS
ldap            dcm4che/slapd-dcm4chee:2.6.8-34.1   "/bin/sh -c '/entryp…"   ldap            Up 5 minutes (healthy)   389/tcp, 636/tcp
postgres        dcm4che/postgres-dcm4chee:17.4-34   "docker-entrypoint.s…"   db              Up 5 minutes (healthy)   5432/tcp
dcm4chee-arc    dcm4che/dcm4chee-arc-psql:5.34.1    "/bin/sh -c '/entryp…"   arc             Up 5 minutes (healthy)   8080/tcp, 8443/tcp, 9990/tcp, 9993/tcp, 11112/tcp, 2762/tcp, 2575/tcp, 12575/tcp
ohif-viewer     ohif/app:latest                      "/docker-entrypoint.…"   ohif            Up 5 minutes (healthy)   80/tcp
nginx           nginx:latest                         "/docker-entrypoint.…"   nginx           Up 4 minutes (healthy)   80/tcp, 443/tcp
portainer       portainer/portainer-ce:latest        "/portainer"              portainer       Up 5 minutes             9000/tcp, 8000/tcp, 9443/tcp
```

**Lihat log real-time (follow):**

```bash
sudo docker compose logs -f arc
```

**Output contoh:**
```
arc  | 09:36:35,362 INFO  [org.wildfly.extension.undertow] (MSC service thread 1-8) WFLYUT0006: Undertow HTTP listener default listening on 0.0.0.0:8080
arc  | 10:28:05,125 INFO  [org.dcm4che.dcm4chee.arc.service.query.QueryService] (default task-1) Query from IP/HOST: 192.168.1.1/192.168.1.1
```

Atau lihat semua log dengan service name:

```bash
sudo docker compose logs -f
```

Output contoh:
```
ldap          | 6939476d.3808e713 0x75a103aa8b28 slapd starting
db            | 2025-12-10 17:11:58.500 WIB [1] LOG:  starting PostgreSQL 17.4
arc           | 09:36:35,362 INFO  [org.wildfly.extension.undertow] WFLYUT0006: Undertow HTTP listener default listening on 0.0.0.0:8080
ohif          | nginx: master process /usr/sbin/nginx -g daemon off;
nginx         | 2025-12-10T17:35:45.512345Z [notice] 1#1: signal process started
```

Atau lihat log service tertentu:

```bash
sudo docker compose logs -f db
sudo docker compose logs -f arc
sudo docker compose logs -f ohif
sudo docker compose logs -f nginx
sudo docker compose logs -f ldap
```

**Lihat log 50 baris terakhir (tanpa follow):**

```bash
sudo docker compose logs --tail=50 arc
```

### 9.4 Pull Image Terbaru

```bash
# Pull semua image terbaru dari registry
sudo docker compose pull
```

Output:
```
[+] Pulling 6/6
 ✔ ldap Pulled                                                              2.1s
 ✔ db Pulled                                                                3.2s
 ✔ arc Pulled                                                              12.5s
 ✔ ohif Pulled                                                              4.3s
 ✔ nginx Pulled                                                             2.8s
 ✔ portainer Pulled                                                         5.1s
```

**Up dengan image terbaru:**

```bash
sudo docker compose up -d
```

Output:
```
[+] Running 7/7
 ✔ Container ldap         Healthy                                          5.5s
 ✔ Container postgres     Healthy                                          5.0s
 ✔ Container dcm4chee-arc Healthy                                         16.6s
 ✔ Container ohif-viewer  Healthy                                          5.5s
 ✔ Container nginx        Healthy                                          3.2s
 ✔ Container portainer    Running                                          1.3s
```

### 9.5 Cek Container Health

**Cek healthcheck status semua container:**

```bash
sudo docker compose ps
```

Lihat kolom STATUS untuk keterangan (Healthy / Unhealthy / Running)

**Cek detail healthcheck satu container:**

```bash
sudo docker inspect dcm4chee-arc | grep -A 20 "Health"
```

Output:
```
"Health": {
    "Status": "healthy",
    "FailingStreak": 0,
    "Log": [
        {
            "Start": "2025-12-10T17:35:45.512345Z",
            "End": "2025-12-10T17:35:50.512345Z",
            "ExitCode": 0,
            "Output": ""
        }
    ]
}
```

**Troubleshoot container yang Unhealthy:**

```bash
# Lihat log container
sudo docker compose logs arc

# Restart container
sudo docker compose restart arc

# Tunggu beberapa saat dan cek status
sleep 30
sudo docker compose ps
```

---

## 10. Port Summary

| Port | Service | Tujuan |
|------|---------|--------|
| 80 | nginx | HTTP (OHIF + Basic Auth) |
| 443 | nginx | HTTPS (OHIF + Basic Auth) |
| 3571 | nginx | Internal OHIF Viewer |
| 8080 | dcm4chee | HTTP Web Interface & Management |
| 8443 | dcm4chee | HTTPS Web Interface & Management |
| 11112 | dcm4chee | DICOM Connections (Modalities) |
| 2575 | dcm4chee | HL7 Receiver |
| 9000 | portainer | Web UI |
| 9443 | portainer | HTTPS UI |

---

## 11. Lisensi

- [dcm4che](https://github.com/dcm4che/dcm4che) - Apache License 2.0
- [OHIF Viewer](https://github.com/OHIF/Viewers) - MIT License
