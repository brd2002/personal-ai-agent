// console.log(process.env.GORQ_API_KEY)
import Groq from "groq-sdk";
import readline from "readline/promises";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function callAgent() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const messages = [
    {
      role: "system",
      content: `
            I am your personal assistant, my name is Honey.
            current datetime: ${new Date().toUTCString()}   
            `,
    },
  ];
  //   messages.push({
  //     role: "user",
  //     content: "What is my expense of this month?",
  //     // content: "hi",
  //   });
  //SECTION - This is for userinput loop
  while (true) {
    const userMessage = await rl.question("You: ");
    if(userMessage === "exit") break
    messages.push({
      role: "user",
      content: userMessage,
    });
    //SECTION -  This is for assistant loop
    while (true) {
      const completion = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        tools: [
          {
            type: "function",
            function: {
              name: "getTotalExpense",
              description: "Get total expense from date to date.",
              parameters: {
                type: "object",
                properties: {
                  from: {
                    type: "string",
                    description: "From date to get the expense.",
                  },
                  to: {
                    type: "string",
                    description: "To date to get the expense.",
                  },
                },
              },
            },
          },
        ],
      });

      // console.log(JSON.stringify(completion.choices[0], null, 2));
      messages.push(completion.choices[0].message);
      const toolCalls = completion.choices[0].message.tool_calls;
      if (!toolCalls) {
        console.log(`Assistent: ${completion.choices[0].message.content}`);
        break;
      }
      for (const tool of toolCalls) {
        const functionName = tool.function.name;
        const argus = tool.function.arguments;
        let result;
        if (functionName === "getTotalExpense") {
          result = getTotalExpense(JSON.parse(argus));
        }
        messages.push({
          role: "tool",
          content: result,
          tool_call_id: tool.id,
        });
      }
      // console.log("------------------------");
      // console.log("Messages:", messages);
    }
  }
  rl.close();
}
callAgent();
function getTotalExpense({ from, to }) {
  //   console.log("calling get total expense tool");
  //ANCHOR -  in reality we should call a tool
  return `30000 INR`;
}
