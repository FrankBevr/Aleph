# How to intergrate azero.id

## Intro

It does Nimish, he is the protocol Lead. Its ens on azerp.

... quick frank break ... 

So there are prizes

If we intertrage azero id we elligble to did track

every teammember is eligbale for efp

it resolves domain -> Adress or address to domain

metadata integration somehwo

We can integrate it on Frontend or on contract side

## Frontend 

- there are @azero-id/resolver-core vanilla
- there are @azero-id/resolver-react react
- no setup of polkadotjs, but api is needed
- no managment of contract addres or metadata or rpc thingies
- its integrated int einkathon boilerplate 

### Example 

- [Link](https://docs.azero.id/integration/frontend-level)
- React version is also avialbe in docs

## Contract

first lets look at architecutrel
- There is a DomainRouter
- User do router
- 3rd parties do router
- router does to .tld .tld .azero
- there are 2 roles, owner and contorller. 
- there to thingies, .tzero for test and .azero for main
- 1. step we have to include it int cargo.toml
- 2. we have to integrate in tcontract
   -  [Snippet from here](https://docs.azero.id/integration/contract-level)

internet problems

- [Link presetnation](https://docs.google.com/presentation/d/1pQKFs3t0qdnZEaFeuIXyTr3toJbanONA/)
- How to add metadata form contract to azero?
  - there is something in the docs


## Outro 

thanks, happy to be here
