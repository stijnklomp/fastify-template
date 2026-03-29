FROM oven/bun:1
WORKDIR /app
RUN apt-get update \
    && apt-get install -y lcov \
    && rm -rf /var/lib/apt/lists/*
ENV FORCE_COLOR=1
CMD set -eux; \
    rm -rf coverage test/unit/coverage/html >/dev/null 2>&1; \
    bun install --frozen-lockfile >/dev/null 2>&1; \
    ENV=test LOGS=test bun test --coverage test/unit --coverage-reporter=text --coverage-reporter=lcov || true; \
    genhtml test/unit/coverage/lcov.info \
      --output-directory test/unit/coverage/html \
      --branch-coverage \
      --legend >/dev/null 2>&1; \
    rm -f test/unit/coverage/.lcov.info* >/dev/null 2>&1