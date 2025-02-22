import { NextFunction, Request, Response, Router } from "express";

const currencyController = Router();

const CURRENCY_API_KEY = process.env.CURRENCY_API_KEY;

const baseUrl = `https://apilayer.net/api/live?access_key=${CURRENCY_API_KEY}&currencies=EUR,GBP,CAD,PLN&source=USD`;

currencyController.get(``, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await fetch(`${baseUrl}`);
    const data = await response.json();

    const rates = data.quotes;
    const cleanedRates: { [key: string]: number } = {};

    for (const key in rates) {
      if (rates.hasOwnProperty(key)) {
        const newKey = key.replace('USD', ''); 
        cleanedRates[newKey] = rates[key];
      }
    }
    
    res.status(200).json(cleanedRates);
  } catch (error) {
    next(error);
  }
});

export default currencyController;
