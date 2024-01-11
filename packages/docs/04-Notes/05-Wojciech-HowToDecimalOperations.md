# How to Decimal Operations

## Intro

Its from Wojciech from Invariant. 

The subtitle is Defi-oriented sue-cases in ink!

He is the founder of Invariant. 
Invariant is a DEX. 
Its orignates in Solana.

They are building their Protocoll on Aleph. 

floating point and fixed point numbers. 

## Main

Floating point
- There is the mantissa which is the floating point
- There is exponent which is the x in 10^x 

Fixed point
- its an integer

Definition. integer is the first number, scale are the floating thingies.

### Overview 

X point is preferd then floating point. Because its not accurate. 

Defi mostly will not use bitwise to do division. ^^

He explains the issue with floating point. 

wait till code.

there are libaries. Not certain if he acutally will shows how to do safemath simple^^

[Code which checks thingies](https://i.ibb.co/CtfFd2v/image.png)


Oh slick here is the [repo](https://github.com/invariant-labs/decimal)

Its actually really cool topic for myself, but is hard to follow. 
Not the most charismatic guy currently, no offense ^^'

the readme is not helpful either. It has 121 commits for this libary. 

Protocoll is open source in a month.

```toml
[dependencies]
decimal = { git= "https://github.com/invariant-labs/decimal"}
```

use it in 
```rs
#[decimal(3,u128)]
pub struct
Price(u64);
```

then  .. damnit missed it : D

Oh now it goe sto the [demo](https://github.com/invariant-labs/decimal-demo)

`type.rs` contains some types. Its actually quite straightforward. I have feeling underling of the marcor there is a bitwise operation with a bunch of cheks. 

Funny. 

He wrote the example 3hours ago. Super simpatic now xD

Yeah then he went step by step thruh the code. 

Actually quite a sweet script to have a idea of how to do division nicely. 

Ok started low went better, got what i wanted. 

I gave him a star on Github.

[Link to protocoll <3](https://github.com/invariant-labs/protocol-a0)

## Outro

Join the discord and he ask if questions.

Thanks everyone

