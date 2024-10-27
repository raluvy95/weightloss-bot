
import { BMIcalculator } from "./utils"

export function infoDependingOnBMI(BMI: number) {
    if (BMI < 20) {
        return "Your body weight is considered too low to be healthy. This may be caused by metabolic rate, lack of food, low appetite and illness.\n" +
            "There are treatements that get you in normal.\n"
            + "- Excercise (by going to gym). This will increase your mass body by growing your muscles.\n"
            + "- Try to eat more.\n"
            + "- Seek your professional help\n"
    } else if (BMI >= 20 && BMI < 25) {
        return "Your body weight is considered normal. If your friends think you are fat, they are not your friends. Keep maintaining your body and don't eat too much food!"
    } else if (BMI >= 25 && BMI < 30) {
        return "Your body weight is considered overweight. You need to lose some weight.\n" +
            "To lose weight, there are some tips you can do"
            + "- Exercise more.\n"
            + "- Don't eat fast food. You need to slow down eating junk food.\n"
            + "- You can use this bot to track your weight weekly!\n"
    } else if (BMI >= 30 && BMI < 50) {
        return "Your body weight is heavy. You need to lose weight <b>IMMEDIATELLY</b>. Otherwise you are carrying a higher risk of heart attack, stroke and diabetes. Fat acceptable activists are NOT your friends.\n\n" +
            "For obese people, here's a better suggestion:\n"
            + "- <b>NEVER, ever eat junk food! NO more junk food! NO kebab, McDonalds, chocolate and many other junk food!!!!!</b>\n"
            + "- Cut down your meal portion depending on the calories you need to maintain. You can check out with /calories\n"
            + "- Try to go outside and walk like a baby's first step. Overtime, you will able to walk 1 km without being exhausted!\n"
    } else if (BMI >= 50) {
        return "Your body weight is so massive that it's an actual danger to your survival, contact a doctor immediately"
    }
}

export function compareWeight(oldWeight: number, newWeight: number, height: number): string {
    const oldBmi = Math.round(BMIcalculator(oldWeight, height))
    const newBmi = Math.round(BMIcalculator(newWeight, height))

    const msg = oldBmi != newBmi ? `\nYour BMI is now <b>${newBmi}</b>` : ''
    if (oldWeight > newWeight) {
        return `<b>Congratuations!</b> 🎉\nYou did a great job! You lost weight by <b>${oldWeight - newWeight}</b> kg!${msg}\nKeep doing what exactly you did!`
    } else if (oldWeight == newWeight) {
        return `<b>Keep doing!</b> 👍\nGood job! Your weight remained the same as last week!`
    } else {
        return `<b>Bad news!</b> 🙁\nYour weight has increased by <b>${newWeight - oldWeight}</b> kg!${msg}\nPlease give up eating junk food and go outside for this week to maintain your weight! You can check via /calories`
    }
}