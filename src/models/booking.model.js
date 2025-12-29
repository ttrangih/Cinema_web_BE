const pool = require("../config/db");

async function createBooking(userId, showtimeId, seatIds) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await cleanupExpiredBookings(client);


    //Lấy thông tin suất chiếu
    const showtimeRes = await client.query(
      "SELECT roomid, price FROM showtimes WHERE id = $1",
      [showtimeId]
    );
    if (showtimeRes.rows.length === 0) {
      throw new Error("Showtime not found");
    }
    const roomId = showtimeRes.rows[0].roomid;
    const basePrice = showtimeRes.rows[0].price;

    //cleanup
    async function cleanupExpiredBookings(client) {
  await client.query(`
    UPDATE bookings
    SET status = 'EXPIRED'
    WHERE status = 'BOOKED'
      AND expires_at < NOW()
  `);

  await client.query(`
    DELETE FROM bookingdetails bd
    USING bookings b
    WHERE bd.bookingid = b.id
      AND b.status = 'EXPIRED'
  `);
}


    //Kiểm tra ghế có thuộc phòng này không
    const seatCheckRes = await client.query(
      `
      SELECT id
      FROM seats
      WHERE roomid = $1
        AND id = ANY($2::int[])
      `,
      [roomId, seatIds]
    );

    if (seatCheckRes.rows.length !== seatIds.length) {
      throw new Error("Some seats do not belong to this showtime room");
    }

    //Kiểm tra ghế đã bị đặt chưa
  const takenRes = await client.query(
  `
  SELECT bd.seatid
  FROM bookingdetails bd
  JOIN bookings b ON bd.bookingid = b.id
  WHERE b.showtimeid = $1
    AND (
      b.status = 'PAID'
      OR (b.status = 'BOOKED' AND b.expires_at >= NOW())
    )
    AND bd.seatid = ANY($2::int[])
  `,
  [showtimeId, seatIds]
);


    if (takenRes.rows.length > 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        reason: "SEAT_TAKEN",
        conflictSeatIds: takenRes.rows.map((r) => r.seatid),
      };
    }

    //Tạo booking
    const bookingRes = await client.query(
  `
  INSERT INTO bookings (userid, showtimeid, bookingtime, status, expires_at)
  VALUES ($1, $2, NOW(), 'BOOKED', NOW() + interval '10 minutes')
  RETURNING id, expires_at
  `,
  [userId, showtimeId]
);

const bookingId = bookingRes.rows[0].id;
const expiresAt = bookingRes.rows[0].expires_at;


    //Tạo bookingdetails cho từng ghế
    for (const seatId of seatIds) {
      await client.query(
        `
        INSERT INTO bookingdetails (bookingid, seatid, price)
        VALUES ($1, $2, $3)
        `,
        [bookingId, seatId, basePrice]
      );
    }

    await client.query("COMMIT");

    return {
  success: true,
  bookingId,
  showtimeId,
  seatIds,
  expiresAt,
};

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createBooking,
};
