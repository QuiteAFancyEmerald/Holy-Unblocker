# TOMP Bare Server

This repository implements the TompHTTP bare server. See the specification [here](https://github.com/tomphttp/specifications/blob/master/BareServerV1.md).

## Usage

We provide a command-line interface for creating a server.

For more features, specify the `--help` option when running the CLI.

### Quickstart

1. Clone the repository locally
```sh
git clone https:/github.com/tomphttp/bare-server-node.git
```

2. Enter the folder
```sh
cd bare-server-node
```

3. Install dependencies
```sh
npm install
```

3. Start the server
```sh
node ./Standalone.mjs --port 80 --host localhost
```

### TLS

In the cloned repository (See [quickstart](#quickstart))

1. Generate OpenSSL certificates (Unless you're bringing your own)
```sh
mkdir tls
openssl genrsa -out tls/key.pem
openssl req -new -key tls/key.pem -out tls/csr.pem
openssl x509 -req -days 9999 -in tls/csr.pem -signkey tls/key.pem -out tls/cert.pem
```

2. Start the server
```sh
node ./Standalone.mjs --port 443 --host localhost --tls --cert tls/cert.pem --key tls/key.pem
```
