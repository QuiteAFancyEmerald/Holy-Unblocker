# Guidelines for contributing code

New Relic welcomes code contributions by the Node community to this module, and
have taken effort to make this process easy for both contributors and our
development team.

When contributing, keep in mind that New Relic customers (that's you!) are
running many different versions of Node, some of them pretty old (most of you
have moved off 0.6, but there are more than a few 0.8 applications still out
there). Changes that depend on the newest version of Node will probably be
rejected, with prejudice if they replace something backwards compatible.

Also be aware that the instrumentation needs to work with a wide range of
versions of the instrumented modules, and that code that looks nonsensical or
overcomplicated may be that way for compatibility-related reasons. Read all the
comments and check the related tests before deciding whether existing code is
incorrect.

## Testing

The agent includes a suite of unit and functional tests which should be used to
verify your changes don't break existing functionality.

Unit tests are stored in `test/`. They're written in
[Mocha](http://visionmedia.github.io/mocha/), and have the extension
`.test.js`.

Generic functional tests are stored in `test/integration/`. They're written in
[node-tap](https://github.com/isaacs/node-tap), and have the extension
`.tap.js`.

Functional tests against specific versions of instrumented modules are stored in
`test/versioned/`. They are also written in `node-tap`.

There are some other tests in `test/versioned-node/`. They are works in progress
and not ready for general-purpose use.


### Setup

To run the tests you need a GNU-compatible make, the openssl command-line
binary, and some services:

* Cassandra
* Memcached
* MongoDB
* MySQL
* Postgres
* Redis

If you have these all running locally on the standard ports, then you are good
to go. However, the suggested path is to use [Docker](http://www.docker.com).
If you use OS X or Windows, use Docker Machine, which can be installed as a part of
[Docker Toolbox](https://www.docker.com/docker-toolbox).  Then, run `make services`
to start docker containers for each of the above services.

If you have these services available on non-standard ports or elsewhere on your
network, you can use the following environment variables to tell the tests where
they are:

* NR_NODE\_TEST_&lt;service&gt;\_HOST
* NR_NODE\_TEST_&lt;service&gt;\_PORT

The service token is the all-caps version of the service name listed above.

### Running the tests

Running the test suite is simple.  Just run:

    npm test

This will install all the necessary modules (and do any required SSL certificate
creation) and run the unit tests in standalone mode, followed by the functional
tests if all of the unit tests pass.

If you don't feel like dealing with the hassle of setting up the servers, just
the unit tests can be run with:

    make unit

### Writing tests

For most contributions it is strongly recommended to add additional tests which
exercise your changes. This helps us efficiently incorporate your changes into
our mainline codebase and provides a safeguard that your change won't be broken
by future development. Because of this, we require that all changes come with
tests. You are welcome to submit pull requests with untested changes, but they
won't be merged until you or the development team have an opportunity to write
tests for them.

There are some rare cases where code changes do not result in changed
functionality (e.g. a performance optimization) and new tests are not required.
In general, including tests with your pull request dramatically increases the
chances it will be accepted.

## And finally...

You are welcome to send pull requests to us - however, by doing so you agree
that you are granting New Relic a non-exclusive, non-revokable, no-cost license
to use the code, algorithms, patents, and ideas in that code in our products if
we so choose. You also agree the code is provided as-is and you provide no
warranties as to its fitness or correctness for any purpose.
