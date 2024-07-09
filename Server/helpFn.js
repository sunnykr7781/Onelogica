export const currentDateWithTime = () =>{
    var currentDate = new Date();

    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();
    var hour = currentDate.getHours();
    var minute = currentDate.getMinutes();
    var second = currentDate.getSeconds();

    var formattedDate = year + "-" + month + "-" + day;
    var formattedTime = hour + ":" + minute + ":" + second;
    
    return (formattedDate + " " + formattedTime);
}