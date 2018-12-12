
const isValidDateString = (dateString) => {
  
  const dateFormat = /^\d{4}[^a-zA-Z0-9]\d{1,2}[^a-zA-Z0-9]\d{1,2}$/;
  
  if (typeof dateString !== "string") {
    () => {
      console.error("Invalid date Entered")
      return false
    }
  } else {
    if (dateFormat.test(dateString)) {
      return true
    } else {
      console.error("Invalid date format")
      return false
    }
  }
}

const doubleDigit = (val) => {
  val < 10
  ? `0${val}`
  : val
}

exports.dateHandler = (date) => {

  if (!date) {

    return new Date().toDateString()

  } else {
    if (isValidDateString(date)) {

      return new Date(date).toDateString()

    } else {
      return false
    }
  }
}