#!/bin/bash

# Script untuk update atau tambah user di nginx/htpasswd

echo "======================================"
echo "  NGINX htpasswd User Management"
echo "======================================"
echo ""

# Menu pilihan
echo "Pilih opsi:"
echo "1. Buat/Update user"
echo "2. Tambah user baru"
echo "3. Lihat user yang ada"
echo ""
read -p "Masukkan pilihan (1-3): " choice

case $choice in
  1)
    # Buat atau update user
    read -p "Username: " username
    read -sp "Password: " password
    echo ""
    read -sp "Confirm password: " password2
    echo ""
    
    if [ "$password" != "$password2" ]; then
      echo "❌ Password tidak sama!"
      exit 1
    fi
    
    # Generate hash
    hash=$(echo "$password" | openssl passwd -stdin -apr1)
    
    # Update file
    echo "$username:$hash" | sudo tee nginx/htpasswd > /dev/null
    echo "✅ User '$username' berhasil di-update!"
    echo ""
    ;;
    
  2)
    # Tambah user baru
    read -p "Username baru: " username
    read -sp "Password: " password
    echo ""
    read -sp "Confirm password: " password2
    echo ""
    
    if [ "$password" != "$password2" ]; then
      echo "❌ Password tidak sama!"
      exit 1
    fi
    
    # Generate hash
    hash=$(echo "$password" | openssl passwd -stdin -apr1)
    
    # Tambah ke file
    echo "$username:$hash" | sudo tee -a nginx/htpasswd > /dev/null
    echo "✅ User '$username' berhasil ditambahkan!"
    echo ""
    ;;
    
  3)
    # Lihat user
    echo "User yang ada:"
    echo "------------------------------------"
    sudo cat nginx/htpasswd | cut -d: -f1
    echo "------------------------------------"
    echo ""
    ;;
    
  *)
    echo "❌ Pilihan tidak valid!"
    exit 1
    ;;
esac

# Restart nginx
echo "Restarting nginx..."
sudo docker compose restart nginx-proxy
echo "✅ Selesai!"
