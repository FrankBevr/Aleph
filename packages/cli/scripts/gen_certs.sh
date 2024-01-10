#!/bin/bash

# Set the domain variable and passphrase
CERT_DOMAIN="*.test.internal"
KEY_PASS="abc"  # Replace with your actual secure passphrase

# Generate CA key and certificate
openssl genrsa -des3 -passout pass:$KEY_PASS -out ca.private.key 2048
openssl req -x509 -new -nodes -key ca.private.key -sha256 -days 1024 -out ca.pem \
    -passin pass:$KEY_PASS \
    -subj "/C=HU/ST=Borsod-Abauj-Zemplen/L=Karancskeszi/O=DeCloud/OU=IT Department/CN=DeCloud CA"

# Generate a new key pair for the server
openssl genrsa -des3 -passout pass:$KEY_PASS -out server.key.secure 2048
# Remove passphrase from the server key
openssl rsa -in server.key.secure -out server.key -passin pass:$KEY_PASS

# Create a CSR using the server key
openssl req -new -key server.key -out server.csr \
    -subj "/C=HU/ST=Borsod-Abauj-Zemplen/L=Karancskeszi/O=DeCloud/OU=Web Security/CN=$CERT_DOMAIN"

# Sign the CSR with the CA
openssl x509 -req -in server.csr -CA ca.pem -CAkey ca.private.key -CAcreateserial \
    -out server.crt -days 500 -sha256 -passin pass:$KEY_PASS

echo "Certificate for $CERT_DOMAIN generated successfully."
