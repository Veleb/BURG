import { Environment } from "../types/environment";

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:3030',
  categories: [
    {
      name: "cars",
      description: "General category for personal and passenger vehicles designed for everyday transportation.",
    },
    {
      name: "equipment",
      description: "Vehicles and machinery designed for construction, agriculture, and industrial tasks.",
    },
    {
      name: "trucks",
      description: "Larger vehicles built for carrying heavy loads, often used for transport and construction.",
    },
    {
      name: "low duty",
      description: "Lightweight trucks designed for smaller cargo loads and urban deliveries.",
    },
    {
      name: "heavy duty",
      description: "Powerful trucks built for transporting large and heavy cargo over long distances.",
    },
    {
      name: "travel",
      description: "Vehicles and accessories related to long-distance journeys, vacations, and road trips.",
    },
    {
      name: "busses",
      description: "Large passenger vehicles designed for public and private transportation services.",
    }
  ],
  publishable_key: "pk_test_51QkrzYBDR55Xtnmwiwb7kpyNFnRQeBE1I8gbrNqwXElfxYEvFNBu3hlxgMsDUG3em8qC89cWCbhjX6d9XxZ286Rm00E6F5uKot"
};
