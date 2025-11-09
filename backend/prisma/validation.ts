import { z } from "zod";

export const cabinSchema = z.object({
  name: z.string().min(1, "Name is required!").max(255),
  bedroom: z.string().regex(/^\d+$/).transform(Number),
  regularPrice: z.string().regex(/^\d+$/).transform(Number),
  discount: z.string().regex(/^\d+$/).transform(Number),
  location: z.string().min(1, "Location is required!").max(255),
});

export const settingSchema = z.object({
  minBookingLength: z.number().positive().optional(),
  maxBookingLength: z.number().positive().optional(),
  maxGuestsPerBooking: z.number().positive().optional(),
  breakfastPrice: z.number().positive().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating must be between 1 and 5!").max(5, "Rating must be between 1 and 5!"),
  comment: z.string().nullable(),
});

export const guestSchema = z.object({
  fullName: z.string().min(1, "Full name is required!").max(255),
  email: z.string().email(),
  password: z.string().min(4, "Password must be at least 4 characters long!").max(255),
});

export const bookingSchema = z.object({
  cabinPrice: z.number().positive(),
  extrasPrice: z.number().nonnegative(),
  discountPrice: z.number().nonnegative(),
  totalPrice: z.number().positive(),
  status: z.enum(["unconfirmed", "checked-out", "checked-in"]),
  isPaid: z.boolean(),
  toValue: z.coerce.date(),
  fromValue: z.coerce.date(),
  cabinId: z.coerce.number(),
  hasBreakfast: z.boolean(),
  guestsNumber: z.number().positive(),
  numOfNights: z.number().positive(),
});

// export const userSchema = z.object({
//   email: z.string().email(),
//   password: z
//     .string()
//     .min(4, 'Password must be at least 4 characters long!')
//     .max(255),
//   role: z.enum(['USER', 'ADMIN']),
//   username: z.string().min(1, 'Username is required!').max(255),
//   ip: z.string().ip(),
//   uid: z.string().uuid(),
// });
