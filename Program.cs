
// using System;
// using System.Collections;
// using System.Globalization;
// using System.IO.Pipelines;
// using System.Runtime.CompilerServices;
// class Calculator
// {

//     public static decimal Input1()
//     {
//         Console.WriteLine("\n \n Insert number 1");
//         return decimal.TryParse(Console.ReadLine(), out decimal result) ? result : 0;
//     }

//     public static decimal Input2()
//     {
//         Console.WriteLine("Insert number 2");
//         return decimal.TryParse(Console.ReadLine(), out decimal result) ? result : 0;
//     }

//     public static decimal Sum(decimal number1, decimal number2) => number1 + number2;
//     public static decimal Sub(decimal number1, decimal number2) => number1 - number2;
//     public static decimal Mult(decimal number1, decimal number2) => number1 * number2;
//     public static decimal Div(decimal number1, decimal number2) => number1 / number2;

//     static void Main(string[] args)
//     {
//     Console.WriteLine("Welcome to the calculator app, please select an option:\n");
//     string? option;
//         do 
//         {
//             Console.WriteLine("\nOptions:\n 1.Sum\n 2.Sub\n 3.Mult\n 4.Div\n 5.Exit\n"); 
//             Console.WriteLine("Please insert an option: ");

//             option = Console.ReadLine() ?? "5";

//             if (option == "5")
//             {
//                 Console.WriteLine("Exiting the calculator app...");
//                 break;
//             }

//             if (option != "1" && option != "2" && option != "3" && option != "4" && option != "5")
//             {
//                 Console.WriteLine("The option you selected isn't available.");
//                 continue;
//             }

//             decimal number1 = Calculator.Input1();
//             decimal number2 = Calculator.Input2();
            
//             switch(option)
//             {
//                 case "1":
//                     Console.WriteLine("Sum function starting up...");
//                     Console.WriteLine($"The sum result of | {number1} + {number2} | is {Calculator.Sum(number1, number2)}");
//                     break;

//                 case "2":
//                     Console.WriteLine("Sub function starting up...");
//                     Console.WriteLine($"The sub result of | {number1} - {number2} | is {Calculator.Sub(number1, number2)}");
//                     break;

//                 case "3":
//                     Console.WriteLine("Mult function starting up...");
//                     Console.WriteLine($"The mult result of | {number1} and {number2} | is {Calculator.Mult(number1, number2)}");
//                     break;

//                 case "4":
//                     Console.WriteLine("Div function starting up...");
//                     Console.WriteLine($"The div result of | {number1} and {number2} | is {Calculator.Div(number1, number2)}");
//                     break;

//             }
//             Console.Write("\nContinue? (y/n): ");
//             option = Console.ReadLine() ?? "n";
        
//         }
//         while (option != "n");
//         Console.WriteLine("Thank you for using the calculator app, goodbye!");

//     }
// }