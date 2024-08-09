MOCHA        = node_modules/.bin/mocha
MOCHA_NOBIN  = node_modules/.bin/_mocha
COVER        = node_modules/.bin/cover
TAP          = node_modules/.bin/tap
ESLINT       = node_modules/.bin/eslint
NODE_VERSION = $(shell node --version)
INTEGRATION  =  test/integration/*.tap.js
INTEGRATION  += test/integration/*/*.tap.js
INTEGRATION  += test/integration/*/*/*.tap.js
INTEGRATION  += test/versioned/*/*.tap.js
SMOKE        = test/smoke/*.tap.js
PRERELEASE	 = test/prerelease/*/*.tap.js
# subcomponents manage their own modules
PACKAGES = $(shell find . -name package.json -and -not -path '*/node_modules/*' -and -not -path '*/example*')
# strip the package.json from the results
NPMDIRS = $(PACKAGES:/package.json=)
# SSL
SSLKEY       = test/lib/test-key.key
# certificate authority, so curl doesn't complain
CACERT       = test/lib/ca-certificate.crt
CASUBJ       = "/O=testsuite/OU=New Relic CA/CN=Node.js test CA"
CACONFIG     = test/lib/test-ca.conf
CAINDEX      = test/lib/ca-index
CASERIAL     = test/lib/ca-serial
# actual certificate configuration
CERTIFICATE  = test/lib/self-signed-test-certificate.crt
SUBJECT      = "/O=testsuite/OU=Node.js agent team/CN=ssl.lvh.me"

.PHONY: all build test-cov test clean notes pending pending-core
.PHONY: unit integration ssl ca-gen smoke lint
.PHONY: sub_node_modules $(SUBNPM)

all: build test

clean:
	find . -depth -type d -name node_modules -print0 | xargs -0 rm -rf
	rm -rf npm-debug.log newrelic_agent.log .coverage_data cover_html
	rm -rf $(SSLKEY) $(CACERT) $(CAINDEX) $(CASERIAL) $(CERTIFICATE)
	rm -rf test/lib/*.old test/lib/*.attr

node_modules: package.json
	@rm -rf node_modules
	npm --loglevel warn install
	node ./bin/check-native-metrics.js

build: clean node_modules
	@echo "Currently using node $(NODE_VERSION)."

test: unit integration

lint: node_modules
	$(ESLINT) ./*.js lib

test-force-all:
	export NR_NODE_TEST_FORCE_ALL=true
	npm install
	npm install oracle
	make test

test-ci: node_modules sub_node_modules $(CERTIFICATE)
	@rm -f newrelic_agent.log
	@$(MOCHA) test/unit --recursive --reporter min
	@$(TAP) $(INTEGRATION)

unit: node_modules
	@rm -f newrelic_agent.log
	@cd test && npm install;
	@case $(NODE_VERSION) in "v0.8."*) cd test;npm i nock@^0.48.0;esac
	@$(MOCHA) -c test/unit --recursive

sub_node_modules:
	@cd test && npm install glob@~3.2.9
	@node test/bin/install_sub_deps

ca-gen:
	@./bin/update-ca-bundle.sh

docker:
	@HOST=`docker-machine ip default 2>/dev/null`; \
	if test "$${HOST}"; then \
	  echo "Using docker-machine host through IP $${HOST}"; \
	  export NR_NODE_TEST_MEMCACHED_HOST=$${HOST}; \
	  export NR_NODE_TEST_MONGODB_HOST=$${HOST}; \
	  export NR_NODE_TEST_MYSQL_HOST=$${HOST}; \
	  export NR_NODE_TEST_REDIS_HOST=$${HOST}; \
	  export NR_NODE_TEST_CASSANDRA_HOST=$${HOST}; \
	  export NR_NODE_TEST_POSTGRES_HOST=$${HOST}; \
	fi; \

integration: node_modules ca-gen $(CERTIFICATE) docker
	@cd test && npm install glob@~3.2.9
	@node test/bin/install_sub_deps integration
	@node test/bin/install_sub_deps versioned
	@case $(NODE_VERSION) in "v0.8."*) cd test;npm i nock@^0.48.0;esac
	time $(TAP) $(INTEGRATION)

prerelease: node_modules ca-gen $(CERTIFICATE) docker
	@cd test && npm install glob@~3.2.9
	@node test/bin/install_sub_deps prerelease
	time $(TAP) $(PRERELEASE)

smoke: clean
	npm install --production --loglevel warn
	npm install tap
	@cd test/smoke && npm install
	time $(TAP) $(SMOKE)

coverage: clean node_modules $(CERTIFICATE)
	@$(COVER) run $(MOCHA_NOBIN) -- test/unit --recursive
	@for tapfile in $(INTEGRATION) ; do \
		$(COVER) run $$tapfile ; \
	done
	@$(COVER) combine
	@$(COVER) report html
	@$(COVER) report

notes:
	find . -name node_modules -prune -o \
	       -name cover_html -prune -o \
	       -name newrelic_agent.log -prune -o \
	       \( -name ".*" -a \! -name . \) -prune -o \
	      -type f -exec egrep -n -H --color=always -C 2 'FIXME|TODO|NOTE|TBD|hax|HAX' {} \; | less -r

pending: node_modules
	@$(MOCHA) test/unit --recursive --reporter list | egrep '^\s+\-'

pending-core: node_modules
	@$(MOCHA) test/unit --recursive --reporter list | egrep '^\s+\-' | grep -v 'agent instrumentation of'

ssl: $(CERTIFICATE)

$(SSLKEY):
	@openssl genrsa -out $(SSLKEY) 1024

$(CAINDEX):
	@touch $(CAINDEX)

$(CASERIAL):
	@echo 000a > $(CASERIAL)

$(CACERT): $(SSLKEY) $(CAINDEX) $(CASERIAL)
	@openssl req \
		-new \
		-subj $(CASUBJ) \
		-key $(SSLKEY) \
		-days 3650 \
		-x509 \
		-out $(CACERT)

$(CERTIFICATE): $(CACERT)
	@openssl req \
		-new \
		-subj $(SUBJECT) \
		-key $(SSLKEY) \
		-out server.csr
	@openssl ca \
		-batch \
		-cert $(CACERT) \
		-config $(CACONFIG) \
		-keyfile $(SSLKEY) \
		-in server.csr \
		-out $(CERTIFICATE)
	@rm -f server.csr

security:
	./node_modules/.bin/nsp check

services:
	if docker ps -a | grep -q "nr_node_memcached"; then \
	  docker start nr_node_memcached; \
	else \
	  docker run -d --name nr_node_memcached -p 11211:11211 memcached; \
	fi
	if docker ps -a | grep -q "nr_node_mongodb"; then \
	  docker start nr_node_mongodb; \
	else \
	  docker run -d --name nr_node_mongodb -p 27017:27017 library/mongo:2; \
	fi
	if docker ps -a | grep -q "nr_node_mysql"; then \
	  docker start nr_node_mysql; \
	else \
	  docker run -d --name nr_node_mysql -p 3306:3306 orchardup/mysql; \
	fi
	if docker ps -a | grep -q "nr_node_redis"; then \
	  docker start nr_node_redis; \
	else \
	  docker run -d --name nr_node_redis -p 6379:6379 redis; \
	fi
	if docker ps -a | grep -q "nr_node_cassandra"; then \
	  docker start nr_node_cassandra; \
	else \
	  docker run -d --name nr_node_cassandra -p 9042:9042 zmarcantel/cassandra; \
	fi
	if docker ps -a | grep -q "nr_node_postgres"; then \
	  docker start nr_node_postgres; \
	else \
	  docker run -d --name nr_node_postgres -p 5432:5432 postgres:9.2; \
	fi
	if docker ps -a | grep -q "nr_node_oracle"; then \
	  docker start nr_node_oracle; \
	else \
	  docker run -d --name nr_node_oracle -p 1521:1521 alexeiled/docker-oracle-xe-11g; \
	fi

	@echo "\nTo run individual integration tests, run 'source test/docker_env_vars.sh' to set\
	 the environment variables for all services.\n"

update_cross_agent_tests:
	rm -rf test/lib/cross_agent_tests
	git clone git@source.datanerd.us:newrelic/cross_agent_tests.git test/lib/cross_agent_tests
	rm -rf test/lib/cross_agent_tests/.git

# versions prior to 1.4(ish) can't upgrade themselves directly to latest so hop to 1.4.28 first.
# Only upgrade to latest if we are on node 0.x
update_npm_global:
	if npm -v | grep -q "^1"; then \
	  npm install -g npm@1.4.28; \
	fi

	if node -v | grep -q "^v0"; then \
	  npm install -g npm@3; \
	fi

	echo "\nUpgrading npm is expected to have many warnings due to tolerance changes over the years.\n"
