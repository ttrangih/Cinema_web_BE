
const pool = require("../config/db");
async function getSeatsByShowtime(showtimeId) {
  // 1. Lấy thông tin suất chiếu (để biết roomid, price)
  const showtimeRes = await pool.query(
    "SELECT roomid, price FROM showtimes WHERE id = $1",
    [showtimeId]
  );

  if (showtimeRes.rows.length === 0) {
    return null; // không có suất chiếu
  }

  const roomId = showtimeRes.rows[0].roomid;
  const basePrice = showtimeRes.rows[0].price;

  // Lấy toàn bộ ghế của phòng đó
  const seatsRes = await pool.query(
    `
    SELECT
      id,
      roomid,
      seatrow,
      seatnumber,
      seattype,
      isactive
    FROM seats
    WHERE roomid = $1
    ORDER BY seatrow, seatnumber
    `,
    [roomId]
  );

  await pool.query(`
  UPDATE bookings
  SET status = 'EXPIRED'
  WHERE status = 'BOOKED'
    AND expires_at < NOW()
`);

await pool.query(`
  DELETE FROM bookingdetails bd
  USING bookings b
  WHERE bd.bookingid = b.id
    AND b.status = 'EXPIRED'
`);


  //Lấy các ghế đã được đặt cho suất chiếu 
  const reservedRes = await pool.query(
  `
  SELECT bd.seatid
  FROM bookingdetails bd
  JOIN bookings b ON bd.bookingid = b.id
  WHERE b.showtimeid = $1
    AND (
      b.status = 'PAID'
      OR (b.status = 'BOOKED' AND b.expires_at >= NOW())
    )
  `,
  [showtimeId]
);


  const reservedSet = new Set(reservedRes.rows.map((r) => r.seatid));

  //Gán isReserved cho từng ghế
  const seats = seatsRes.rows.map((s) => ({
    id: s.id,
    roomId: s.roomid,
    row: s.seatrow,
    number: s.seatnumber,
    type: s.seattype,
    isActive: s.isactive,
    isReserved: reservedSet.has(s.id),
    price: basePrice, // đơn giản: 1 suất = 1 giá / ghế
  }));

  return {
    showtimeId: Number(showtimeId),
    roomId,
    basePrice,
    seats,
  };
}

module.exports = {
  getSeatsByShowtime,
};
