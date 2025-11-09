import { NextFunction, Request, Response } from "express";
import prisma from "../../prisma/client.js";
import { bookingSchema } from "../../prisma/validation.js";

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  // console.log(req.user);
  // @ts-ignore
  const { uid } = req.user;
  if (!uid) return res.json({ error: "Invalid user" });

  // console.log("req.body--", req.body);

  const result = bookingSchema.safeParse(req.body);
  if (!result.success) {
    console.log(result.error);
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const {
    cabinId,
    fromValue,
    toValue,
    hasBreakfast,
    guestsNumber,
    totalPrice,
    cabinPrice,
    discountPrice,
    extrasPrice,
    isPaid,
    status,
    numOfNights,
  } = result.data;

  const user = await prisma.guests.findUnique({
    where: {
      uid,
    },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  try {
    const booking = await prisma.bookings.create({
      data: {
        cabinId,
        guestId: uid,
        startDate: fromValue,
        endDate: toValue,
        hasBreakfast,
        isPaid,
        numGuests: guestsNumber,
        numNights: numOfNights,
        status,
        cabinPrice,
        extrasPrice,
        discountPrice,
        totalPrice,
      },
    });
    res.json(booking);
  } catch (error) {
    res.status(400).json(error);
  }
};

interface Query {
  filter: {
    field: string;
    value: string;
  };
  sortBy: {
    field: string;
    direction: string;
  };
  page: number;
}

export const getBookings = async (req: Request<{}, {}, {}, Query>, res: Response, next: NextFunction) => {
  const { filter, sortBy, page } = req.query;

  try {
    const bookings = await prisma.bookings.findMany({
      where: {
        [filter?.field]: filter?.value,
      },
      orderBy: {
        [sortBy.field]: sortBy.direction,
      },
      include: {
        guest: true,
        cabin: true,
      },
      skip: (page - 1) * 10,
      take: 10,
    });

    const count = await prisma.bookings.count({
      where: {
        [filter?.field]: filter?.value,
      },
    });

    res.json({ bookings, count });
  } catch (error) {
    res.status(400).json(error);
  }
};

export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const booking = await prisma.bookings.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        guest: true,
        cabin: true,
      },
    });
    res.json(booking);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const updateBooking = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  // const result = bookingSchema.safeParse(req.body);
  // if (!result.success) {
  //   return res.status(400).json({ error: result.error.issues[0].message });
  // }
  // const { isPaid, status, hasBreakfast, extrasPrice, totalPrice } = result.data;
  const { isPaid, status, hasBreakfast, extrasPrice, totalPrice } = req.body;
  try {
    const booking = await prisma.bookings.update({
      where: {
        id: parseInt(id),
      },
      data: {
        isPaid,
        status,
        hasBreakfast,
        extrasPrice,
        totalPrice,
      },
    });
    res.json(booking);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const booking = await prisma.bookings.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json(booking);
  } catch (error) {
    res.status(400).json(error);
  }
};

interface DateQuery {
  date: string;
}

export const getBookingsAfterDate = async (req: Request<{}, {}, {}, DateQuery>, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;

    const bookings = await prisma.bookings.findMany({
      where: {
        created_at: {
          gte: date,
        },
      },
      select: {
        created_at: true,
        totalPrice: true,
        extrasPrice: true,
      },
    });
    res.json(bookings);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const getStaysAfterDate = async (req: Request<{}, {}, {}, DateQuery>, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;

    const bookings = await prisma.bookings.findMany({
      where: {
        created_at: {
          gte: date,
          lte: new Date().toISOString(),
        },
      },
      include: {
        guest: true,
      },
    });
    res.json(bookings);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const getTodayActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const bookings = await prisma.bookings.findMany({
      where: {
        OR: [
          {
            startDate: {
              equals: new Date(today),
            },
            status: {
              equals: "unconfirmed",
            },
          },
          {
            endDate: {
              equals: new Date(today),
            },
            status: {
              equals: "checked-in",
            },
          },
        ],
      },
      include: {
        guest: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });
    res.json(bookings);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const getBookingByCabinId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const bookings = await prisma.bookings.findMany({
      where: {
        cabinId: parseInt(id),
      },
    });
    res.json(bookings);
  } catch (error) {
    res.status(400).json(error);
  }
};
