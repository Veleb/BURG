import { Component, OnInit } from '@angular/core';

interface FAQ {
  number: number;
  question: string;
  answer?: string;
  steps?: string[];
  active: boolean;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
})
export class FaqComponent {
  generalQuestions: FAQ[] = [
    {
      number: 1,
      question: 'What is BURG?',
      answer:
        'BURG is a commercial vehicle rental marketplace that connects customers with rental agencies and individual vehicle owners. Whether you need a truck, commercial vehicle, or even a car for business or personal use, BURG provides a seamless and secure platform for bookings.',
      active: false,
    },
    {
      number: 2,
      question: 'How does BURG work?',
      answer:
        'BURG allows customers to search for available vehicles, compare options, and book them directly through the platform. Rental agencies and vehicle owners can list their vehicles, manage bookings, and receive payments. The platform ensures a smooth process by verifying listings and providing in-app support.',
      active: false,
    },
    {
      number: 3,
      question: 'Is BURG available in my city?',
      answer:
        'BURG is expanding rapidly! Currently, we operate in major cities and industrial hubs. You can check availability in your area by visiting the app or website.',
      active: false,
    },
    {
      number: 4,
      question: 'What types of vehicles can I rent on BURG?',
      answer:
        'You can rent a wide range of commercial vehicles, including: Trucks (light, medium, and heavy-duty), Pickup trucks, Vans and cargo vehicles, Specialized vehicles like refrigerated trucks and construction vehicles, Cars for personal or business use.',
      active: false,
    },
    {
      number: 5,
      question: 'Who can use BURG?',
      answer:
        'BURG is designed for both businesses and individuals who need rental vehicles. Whether you are a logistics company, a small business owner, or an individual looking for temporary vehicle access, BURG is the right solution for you.',
      active: false,
    },
  ];

  bookingQuestions: FAQ[] = [
    {
      number: 6,
      question: 'How do I book a vehicle?',
      steps: [
        'Download the BURG app or visit our website',
        'Enter your location, rental period, and vehicle type',
        'Browse available options and compare prices',
        'Select a vehicle and confirm the booking',
        'Make a secure payment through the platform',
        'Receive confirmation and pick up the vehicle or opt for delivery (if available)',
      ],
      active: false,
    },
    {
      number: 7,
      question: 'What payment methods does BURG accept?',
      answer:
        'BURG supports multiple payment options, including: Credit/debit cards (Visa, Mastercard, etc.), UPI payments, PayTm, Net banking, Wallet payments.',
      active: false,
    },
    {
      number: 8,
      question: 'Are there any security deposits?',
      answer:
        "Some vehicle listings may require a refundable security deposit. The amount depends on the vehicle type and the rental agency's policy. Deposits are fully refunded upon successful return of the vehicle in good condition.",
      active: false,
    },
    {
      number: 9,
      question: 'Can I modify or cancel my booking?',
      answer:
        'Yes! You can modify or cancel your booking within the allowed cancellation window. However, cancellation fees may apply based on the rental agency’s policy. Check the cancellation terms before confirming your booking.',
      active: false,
    },
    {
      number: 10,
      question: 'Can I get a refund if I cancel my booking?',
      answer:
        'Refunds depend on the cancellation policy of the rental agency. If you cancel within the free cancellation period, you’ll receive a full refund. After this period, partial refunds may apply.',
      active: false,
    },
  ];

  listingQuestions: FAQ[] = [
    {
      number: 11,
      question: 'How do I list my vehicle on BURG?',
      steps: [
        'Sign up as a vehicle owner or rental agency',
        'Upload vehicle details, including pictures, specifications, and rental terms',
        'Set pricing, availability, and security deposit (if required)',
        'Submit for verification',
        'Once approved, your vehicle will be live for bookings!',
      ],
      active: false,
    },
    {
      number: 12,
      question: 'How do I receive payments for rentals?',
      answer:
        'Payments for bookings are credited directly to your registered bank account or wallet after the rental period ends. Payment cycles are usually within 24-48 hours of the vehicle return.',
      active: false,
    },
    {
      number: 13,
      question: 'Can I set my own rental prices?',
      answer:
        'Yes! Owners and agencies have full control over pricing. BURG provides pricing recommendations based on market trends to help you stay competitive.',
      active: false,
    },
    {
      number: 14,
      question: 'What happens if my vehicle is damaged during a rental?',
      answer:
        'BURG ensures security by requiring customers to accept rental agreements that cover damages. If a vehicle is damaged, the responsible customer is required to pay for repairs, either through the security deposit or additional charges.',
      active: false,
    },
  ];

  supportQuestions: FAQ[] = [
    {
      number: 15,
      question: 'Is it safe to rent vehicles on BURG?',
      answer:
        'Yes! BURG verifies all vehicle listings and ensures transparency between renters and owners. Additionally, our in-app messaging and support services provide assistance in case of any issues.',
      active: false,
    },
    {
      number: 16,
      question: 'How does BURG handle disputes?',
      answer:
        'If you face any issues with a rental, you can report it through the app. Our support team will review the situation, mediate between the parties, and resolve disputes fairly.',
      active: false,
    },
    {
      number: 17,
      question: 'Can I contact the vehicle owner before booking?',
      answer:
        'Yes! BURG provides an in-app chat and call option to clarify details with the vehicle owner before booking.',
      active: false,
    },
    {
      number: 18,
      question: 'How do I contact BURG support?',
      answer:
        'You can reach our support team through: In-app chat support, Email: akash@burgrental.com, Phone: +91 809 985 3142 (Available 24/7).',
      active: false,
    },
  ];

  additionalQuestions: FAQ[] = [
    {
      number: 19,
      question: 'Does BURG offer insurance for rentals?',
      answer:
        'BURG partners with insurance providers to offer rental protection plans. Some vehicle listings may include insurance coverage, while others allow you to purchase optional coverage.',
      active: false,
    },
    {
      number: 20,
      question: 'Can I track my rental vehicle in real time?',
      answer:
        'Yes! BURG provides live tracking for rentals, ensuring better security and management for both renters and owners.',
      active: false,
    },
    {
      number: 21,
      question: 'Are there any loyalty programs or discounts?',
      answer:
        'Yes! BURG offers periodic discounts, referral bonuses, and loyalty rewards for frequent renters. Keep an eye on promotions within the app!',
      active: false,
    },
    {
      number: 22,
      question: 'Can I rent a vehicle for long-term use?',
      answer:
        'Yes! BURG supports both short-term and long-term rentals. You can negotiate long-term pricing directly with the vehicle owner or agency.',
      active: false,
    },
  ];

  // ngOnInit() {}

  toggleFAQ(faq: FAQ) {
    faq.active = !faq.active;
  }
}
