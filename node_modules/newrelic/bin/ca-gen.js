#!/usr/bin/env node

var fs   = require('fs')
  , path = require('path')
  , glob = require('glob')
  ;

var CERT_PATH = path.join(__dirname, '..', '..', 'SSL_CA_cert_bundle', '*.pem');

var OUTFILE =
  path.join(__dirname, '..', 'lib', 'collector', 'ssl', 'certificates.js');

var HEADER =
  "/**\n" +
  " * certificates.js - CA bundle for SSL communication with RPM.\n" +
  " *\n" +
  " * This file contains the X509 certificates used to communicate with New Relic\n" +
  " * over SSL.\n" +
  " */\n\n";

function Certificate() {
  this.name = null;
  this.body = null;
}

Certificate.prototype.toEntry = function toEntry() {
  var output = '  // ' + this.name + '\n';
  var rawPEM = this.body.split('\n');

  var line;
  for (var i = 0; i < rawPEM.length; i++) {
    line = rawPEM[i];
    // some Thawte certificates have Windows line endings
    line = line.replace('\r', '');
    if (line.match(/END CERTIFICATE/)) {
      output += '  "' + line + '\\n"';
      break;
    }
    else {
      output += '  "' + line + '\\n" +\n';
    }
  }

  return output;
};

function loadCerts(root, callback) {
  glob(root, function (error, files) {
    if (error) return callback(error, null);

    var certificates = [];
    console.error("Loading %s certficates.", files.length);

    var certificate, file;
    for (var i = 0; i < files.length; i++) {
      file = files[i];
      certificate = new Certificate();
      certificate.name = path.basename(file, '.pem');
      certificate.body = fs.readFileSync(file, 'ascii');

      certificates.push(certificate);
    }

    callback(null, certificates);
  });
}

function dumpCerts(error, certs) {
  if (error) {
    console.error("got %s reading certs; bailing out", error.message);
    process.exit(1);
  }

  fs.writeFileSync(
    OUTFILE,
    HEADER +
    'module.exports = [\n' +
    certs.map(function cb_map(cert) { return cert.toEntry(); }).join(',\n\n') +
    '\n]\n'
  );
}

loadCerts(CERT_PATH, dumpCerts);
