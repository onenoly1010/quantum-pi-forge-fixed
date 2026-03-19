# Code Citations

## License: unknown
https://github.com/xibolun/myNote/blob/e1df971a7d676d2229e3d980cfe8d1dc0dd6376f/content/post/k8s/k8s%E2%80%93%E2%80%93jmx%E7%9B%91%E6%8E%A7.md

```
exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped
    networks:
      -
```


## License: BSD-3-Clause
https://github.com/reef-technologies/cookiecutter-rt-django/blob/2f3c5a0ae545d97a7a1b47c908ad624ac37ab5d7/%7B%7Bcookiecutter.repostory_name%7D%7D/devops/tf/main/modules/admin/parameters.docker-compose.tf

```
exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped
    networks:
      -
```


## License: unknown
https://github.com/kamaok/devops-netology/blob/392caf1c8921b003aa209d82e5b9c33eccabeaf0/05-virt-04-docker-compose/README.md

```
exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped
    networks:
      -
```


## License: unknown
https://github.com/abdurrah1m/Professionals_2024/blob/4a0106856577e08cac41723c92f9f9bdd2bc88e1/%D0%9C%D0%BE%D0%B4%D1%83%D0%BB%D1%8C%20%D0%92/NodeExporter%2C%20Prometheus%20%D0%B8%20Grafana.md

```
exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped
    networks:
      -
```

