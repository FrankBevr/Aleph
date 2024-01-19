#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
pub mod deploycash {
    /// A szerződés tárol egy egyszerű boolean értéket.
    #[ink(storage)]
    pub struct Deploycash {
        /// Egy boolean változó.
        value: bool,
    }

    impl Deploycash {
        /// Létrehoz egy új HelloWorld szerződést, alapértelmezett értékkel (`false`).
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { value: false }
        }

        /// Lekérdezi a jelenlegi értéket.
        #[ink(message)]
        pub fn get(&self) -> bool {
            self.value
        }

        /// Megváltoztatja a boolean értékét (`true`-ról `false`-ra, és `false`-ról `true`-ra).
        #[ink(message)]
        pub fn toggle(&mut self) {
            self.value = !self.value;
        }
    }
}

