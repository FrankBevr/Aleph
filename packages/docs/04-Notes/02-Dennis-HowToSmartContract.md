# How to Smart Contract

## Intro

- Frontend matters
- Frontend shouldn't be underestimated, its complex
- Ink tooling
  - contract level
    - ink!
    - cargo-contract
    - psp22, psp32
  - Nodes
    - substrate-contracts-node
    - swanky
  - Deployment & Interaction
    - cargo contract
    - Drink!
    - contracts-ui
    - polkadotjs/apps
  - Frontend
    - polkadot-js/api
    - useInkathon
    - useInk
  - TypeGeneartion
    - @727/typechain-polkadot
    - @subsquid-sdk/ink-typegen
  - Boilerplate
    - ink!athon

  There is a [link](wiki)

## Inkathon 

- inkathon is a monorepo
- 250Stars on github
- 130 are depend on it
- pnpm is reccomend
- there are contracts, there are frontend
- there are dockerfiles
- monorepo structure
  - contracts
    - rust cargo ink
    - substrate-contracts-node
    - contract-ui & polkadot.js/apps
    - custom shorthand scripts
  - frontend
    - nextjs (typescript)
    - basic sytling & compoents + polkadotjs 
    - more
- Why?
  - saves code
  - imports contracts only once
  - shorthands for gas estimation, queries, tx's 
  - more


## Demo 

1. `gh repo clone @socio-labs/inkathon`
2. `cd inkathon`
3. `code .`
4. Open in worksspace
5. `pnpm install`
6. `pnpm run dev`
7. :tada:
8. Ther is a wallet conntect button
9. install talisman
10. tzero is a the testnet token
11. There are shrothand links
12. greeter smartcontract as a sample
13. test the greeter, sign transaction
14. and done
15. more projects
16. there are contracts
17. they have package.json, for scripts
18. contracts/src/greeter there is the contract 
19. there is storage, one string is storage
20. there are impl, for functions
21. constrcutor is called by deployemnt
22. one getter and one setter
23. cool thingies are natives test in the same file
24. inline clicking for test are cool
25. there is a deployment folder, every subfolder is a contracts
26. deployments holds addreses and abis and binary 
27. you have to copy a lot without inkathon, with inkathon it does it automatically
28. now local node
29. in contracts we run pnpm run build to build contract
30. it automatically moves targets files to deplyoments folder 
31. pnpm run node for running substrate local node
32. its sweetly runnign
33. in another terminal in contracts pnpm run deploy it deploys the contract
34. It deploys and and in deplyoments
35. back to frontend.
36. there is a .env and swap to development
37. refresh to browser and tada now its on local node
38. :tada: 
39. update greeting will not work because there are no funds on the current account
40. I go to polkadotJS/apps link and then i go to accounts and let allice send 100 units to my account
41. now i can update greeter, sign and updated.
42. :tada: 
43. more frontend talk
44. eslint, prettier, next, tialwind is working
45. in src there is app folde
46. deployments folder hold deployments.ts with all necessary variables.
47. Everyhting is warppend into a useiNkotahon provider 
48. ther eis a chaininfo compoentns which is a default compoents which we can see
49. useRegisteredContract is typesafe thats one of the customehooks of useinkathon
50. now redeployment pnpm run deploy
51. and everything uptodate 
52. the greeter compoent does the magic, so there is readfunction
53. so decoded result into something usefull
54. contracTXWithToast shows error messages. 
55. there is a ui for and it uses tailwind and it uses chadcdn 
56. seems likes thats it. 
57. there are workshop snippet, its a something configuresd int hte workshpaces
58. now back to Presetnation

## Outro

If question just ask.
