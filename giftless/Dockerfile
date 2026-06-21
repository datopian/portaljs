# Giftless + the R2 storage backend, ready to deploy.
#
# We extend the prebuilt datopian/giftless image rather than `pip install giftless`:
# giftless 0.5.0 breaks on modern deps (marshmallow 4 dropped the `missing=` kwarg,
# Flask 3, etc.), and the image pins a working set (po-e24).
FROM datopian/giftless:latest

# R2Storage subclass + config baked onto the PYTHONPATH. The JWT key is NOT baked
# in — it is mounted at /etc/giftless/jwt_key at run time (see docker-compose.yml).
COPY r2storage.py /app/r2storage.py
COPY giftless.yaml /app/giftless.yaml

ENV PYTHONPATH=/app \
    GIFTLESS_CONFIG_FILE=/app/giftless.yaml

EXPOSE 5000

# The image defaults to a uwsgi *socket*; serve plain HTTP instead so a reverse
# proxy / load balancer can sit in front. Mirrors the run command proven in po-e24.
ENTRYPOINT ["tini", "--"]
CMD ["uwsgi", "--http", "0.0.0.0:5000", "--pythonpath", "/app", \
     "--module", "giftless.wsgi_entrypoint", "--callable", "app", \
     "--manage-script-name", "-M", "-T", "--threads", "2", "-p", "2"]
