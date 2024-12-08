import { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "./InterviewApp.module.css";

function InterviewApp() {
  const [jobTitle, setJobTitle] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [userResponse, setUserResponse] = useState("");
  const [resetInterview, setResetInterview] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

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
      const response = await axios.post("http://localhost:4000/api/interview", {
        jobTitle,
        userResponse,
        resetInterview,
      });

      setChatHistory([
        ...chatHistory,
        { role: "user", text: userResponse },
        { role: "ai", text: response.data.aiResponse },
      ]);

      setUserResponse(""); // clear
      setQuestionCount(questionCount + 1);

      if (questionCount >= 6) {
        const feedbackResponse = await axios.post(
          "http://localhost:4000/api/feedback",
          {
            jobTitle,
            chatHistory,
          }
        );
        setChatHistory([
          ...chatHistory,
          { role: "ai", text: feedbackResponse.data.feedback },
        ]);
      }
    } catch (error) {
      console.error(
        "❌ Error sending response:",
        error.response ? error.response.data : error.message
      );
    }
  };

  //reset interview
  const handleReset = () => {
    setChatHistory([]);
    setUserResponse("");
    setResetInterview(true);
    setQuestionCount(0);
  };

  // to start the interview sends a POST request to the server
  // Sends jobTitle and resetInterview to init chat session
  // if server responds, add it to chat history for ui
  // log cslgs for error and success
  const handleStartInterview = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/startInterview",
        {
          jobTitle,
          resetInterview: true,
        }
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
        <h2 className={styles.heading}>Mock Interview</h2>
        <div className={styles.jobTitleContainer}>
          <label className={styles.label}>Job Title:</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Enter Job Title Here"
            className={styles.inputBox}
          />
        </div>

        {/* start interview */}
        {chatHistory.length < 1 && (
          <button onClick={handleStartInterview} className={styles.startButton}>
            Start Interview
          </button>
        )}

        {/* chat history display */}
        {chatHistory.length > 0 && (
          <div className={styles.chatHistoryContainer}>
            {chatHistory.map((entry, index) => (
              <div key={index} className={styles.role}>
                <strong>
                  {entry.role === "user" ? "You" : "AI Interviewer"}
                </strong>
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
              Send message
            </button>
          </div>
        )}

        {/* Reset button */}
        <button onClick={handleReset} className={styles.resetButton}>
          Restart Interview
        </button>
      </div>
    </>
  );
}

export default InterviewApp;
