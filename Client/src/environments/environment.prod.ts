import { Environment } from "../types/environment";

export const environment: Environment = {
  production: true,
  apiUrl: 'https://burg-uu6y.onrender.com', 
  categories: [
    {
      name: "cars",
      description: "General category for personal and passenger vehicles designed for everyday transportation.",
    },
    {
      name: "trucks",
      description: "Larger vehicles built for carrying heavy loads, often used for transport and construction.",
    },
    {
      name: "heavy machinery",
      description: "Industrial-grade equipment like excavators, bulldozers, and cranes used in construction, mining, and agriculture.",
    },
    {
      name: "commercial cars",
      description: "Vehicles used for business purposes, including taxis, delivery vans, and company fleets.",
    },
    {
      name: "sedan",
      description: "A four-door passenger car with a separate trunk, known for comfort and practicality.",
    }
  ],
  publishable_key: "pk_test_51QkrzYBDR55Xtnmwiwb7kpyNFnRQeBE1I8gbrNqwXElfxYEvFNBu3hlxgMsDUG3em8qC89cWCbhjX6d9XxZ286Rm00E6F5uKot"
};
