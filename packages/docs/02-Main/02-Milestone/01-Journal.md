---
title: Deploy Cash - Milestone 2
---

# Deploy Cash - Milestone 2

:::info
This document records our progress of the _first planned milestone_ of the _Deploy Cash_ project. It acts as a journal of our work, and shows the current state of the project on `2024.01.18` (to-be-updated).
:::

## Goals

* 🚀 Make subdomains of `deploy.cash` available for use with the CLI
* 🚀 Separate _ingress_, _CDN_ nodes
    * 📡 Single ingress node is exposed in the `*.deploy.cash` `A` record
    * 📡 Ingress node connects to the _hub_, and the _brokers_
    * 📡 CDN node connects to the _hub_, and the _brokers_
    * 📡 Configuration is synced from the _hub_
    * 📡 Nodes communicate through the _brokers_ (client-side load balancing)
    * 📡 Proxies also connect to the _brokers_
* 🚀 Create _hub_ nodes
    * 🤝 Store configuration
    * 🤝 Authenticate remote users
    * 🤝 Authenticate nodes
    * 🤝 Expose broker nodes to ingress nodes, CDN nodes, and proxies
* 🚀 Create _broker_ nodes
    * 📪 Message brokers as a _network backbone_
    * 📪 Publish connected _CDN nodes_ to _ingresses_, _proxy nodes_ to _ingresses_ and _CLIs_
    * 📪 Forward messages between nodes
    * 📪 Clients connect to multiple brokers, and load-balance between them
* 🚀 Up the CLI
    * ☀️ Logging
    * ☀️ Example use in CI/CD for CDN deployment
    * ☀️ Example systemd usage
    * ☀️ Example local development usage
    * ☀️ Show broker connection state in proxy deployment mode

# Rundown

:::info
This section contains a detailed rundown of the following:

* Building the project
* Testing different parts of the project
* Setting up the software-as-a-service infrastructure
* Deploying to a testnet
* Testing on the testnet

:::

## Building

:::info
In Milestone 2, adding the `@deploycash/contracts` package introduces new build-time dependencies on the host, that is building the project. First, we show how to set up a _Linux-based build environment_ (using _WSL on Windows_) for the project.
:::


