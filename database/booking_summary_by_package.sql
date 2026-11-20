SELECT
    tp.package_id,
    tp.region_name,
    tp.package_name,
    COUNT(br.booking_id) AS total_bookings
FROM tour_packages tp
LEFT JOIN booking_requests br
    ON tp.package_id = br.package_id
GROUP BY
    tp.package_id,
    tp.region_name,
    tp.package_name
ORDER BY tp.package_id;