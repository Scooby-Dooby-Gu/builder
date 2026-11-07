export const getTime = (datetime: string) => {
    const [date, time] = datetime.split(" ");

    const [day, month, year] = date.split("/");

    let [hours, minutes] = time.split(":");

    const suffix = minutes.slice(2, minutes.length);

    minutes = minutes.slice(0, 3);

    const finalHours = suffix === "PM" ? parseInt(hours) + 12 : parseInt(hours);

    const parsedDatetime = new Date(parseInt(year), parseInt(month), parseInt(day), finalHours, parseInt(minutes));

    return parsedDatetime.getTime();
}
