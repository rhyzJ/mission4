import { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "./InsuranceRec.module.css";

function InsuranceRec() {
  const [chatHistory, setChatHistory] = useState([]);
  const [userResponse, setUserResponse] = useState("");

  // create a ref hook to hold the chat history container element
  const chatHistoryEndRef = useRef(null);

  // scroll to the bottom when chatHistory changes
  useEffect(() => {
    if (chatHistoryEndRef.current) {
      chatHistoryEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  //use axios to send to endpoint

  const handleSubmission = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/api/interview", {
        userResponse,
      });

      setChatHistory([
        ...chatHistory,
        { role: "user", text: userResponse },
        { role: "ai", text: response.data.aiResponse },
      ]);

      setUserResponse(""); // clear
    } catch (error) {
      console.error(
        "❌ Error sending response:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // to start the interview sends a POST request to the server
  // if server responds, add it to chat history for ui
  // log cslgs for error and success
  const handleStartTina = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/startInterview"
      );

      if (response.data && response.data.aiResponse) {
        setChatHistory([
          {
            role: "ai",
            text: response.data.aiResponse,
          },
        ]);
      } else {
        console.log("No content received from the server.");
      }

      console.log("✅ Interview started");
    } catch (error) {
      console.error("❌ Error starting interview:", error);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <img
          className={styles.logo}
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuUSrMhuoa9oRL7pyUTPJASr16X0Pm6Om8yQ&s"
          alt="turners logo"
        />
        <h1 className={styles.heading}>Meet Tina</h1>
        <h2 className={styles.subheading}>
          Your AI Insurance Policy Assistant
        </h2>

        {/* start chat */}
        {chatHistory.length < 1 && (
          <button onClick={handleStartTina} className={styles.startButton}>
            Start Chatting to Tina
          </button>
        )}

        {/* chat history display */}
        {chatHistory.length > 0 && (
          <div className={styles.chatHistoryContainer}>
            {chatHistory.map((entry, index) => (
              <div key={index} className={styles.role}>
                <strong>{entry.role === "user" ? "You" : "Tina"}</strong>
                <span>{entry.text}</span>
              </div>
            ))}
            {/* This div is used to scroll to the bottom of chat history */}
            <div ref={chatHistoryEndRef}></div>
          </div>
        )}

        {/* user response input */}
        {chatHistory.length > 0 && (
          <div className={styles.userInputContainer}>
            <input
              type="text"
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Type your response here"
              className={styles.inputBox}
            />
            <button onClick={handleSubmission} className={styles.submitButton}>
              Submit Response
            </button>
          </div>
        )}
      </div>
      <div className={styles.imgContainer}>
        <img
          className={styles.tinaImg}
          src="https://content.tgstatic.co.nz/webassets/globalassets/search-wizard/search-wizard-tina-mobile-v2.png"
        />
      </div>
    </>
  );
}

export default InsuranceRec;
