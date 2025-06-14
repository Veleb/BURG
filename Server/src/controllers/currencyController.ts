import { NextFunction, Request, Response, Router } from "express";

const currencyController = Router();

// const CURRENCY_API_KEY = process.env.CURRENCY_API_KEY;

// const baseUrl = `https://apilayer.net/api/live?access_key=${CURRENCY_API_KEY}&currencies=EUR,GBP,CAD,JPY,USD&source=INR`;

const hardcodedRates: { [key: string]: number } = {
  USD: 0.01169,
  EUR: 0.01029,
  GBP: 0.00876,
  CAD: 0.01624,
  JPY: 1.67943
};

currencyController.get("", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(hardcodedRates);
  } catch (error) {
    next(error);
  }
});


// currencyController.get(``, async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const response = await fetch(`${baseUrl}`);
//     const data = await response.json();

//     const rates = data.quotes;
//     const cleanedRates: { [key: string]: number } = {};

//     for (const key in rates) {
//       if (rates.hasOwnProperty(key)) {
//         const newKey = key.replace('USD', ''); 
//         cleanedRates[newKey] = rates[key];
//       }
//     }
    
//     res.status(200).json(cleanedRates);
//   } catch (error) {
//     next(error);
//   }
// });

export default currencyController;
