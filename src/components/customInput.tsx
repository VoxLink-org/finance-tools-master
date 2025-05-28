import { InputProps } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import Cookies from "js-cookie";
import { useState } from "react";

const CREDIT = 3;
export function CustomInput({ inProgress, onSend }: InputProps) {
  const [error, setError] = useState("");
  const handleSubmit = (value: string) => {
    if (!value.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const creditsKey = `credits_${today}`;
    const creditsData = Cookies.get(creditsKey);

    let credits = creditsData ? parseInt(creditsData) : 0;

    if (credits >= CREDIT) {
      setError(`Daily trial limit (${CREDIT}) reached. Try again tomorrow.`);
      return;
    }

    credits++;
    Cookies.set(creditsKey, credits.toString(), { expires: 1 });
    setError("");
    onSend(value);
  };

  const wrapperStyle = "flex gap-2 p-4 border-t";
  const inputStyle = "flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:border-gray-500 disabled:bg-gray-100";
  const buttonStyle = "px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed";


  return (
    <div>
      {error && <div className="text-red-500 text-sm mt-2 text-center">{error} <a href="/credits" className="underline text-gray-500" target="_blank">Top up your credits</a></div>}
      <div className={wrapperStyle}>
        <input
          disabled={inProgress || Boolean(error)}
          type="text"
          placeholder={`Ask your question here...${CREDIT} daily trial limit`}
          className={inputStyle}
        />
        <button
          disabled={inProgress}
          className={buttonStyle}
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
            handleSubmit(input.value);
            input.value = '';
          }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}

