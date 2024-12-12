import { useState, useRef, useEffect } from "react";
//useRef creates a reference to DOM elements
//useEffect to perform side effects (used for scrolling) when dependency changes
import axios from "axios"; //makes http requests to backend
import styles from "./InsuranceRec.module.css";

function InsuranceRec() {
  const [chatHistory, setChatHistory] = useState([]);
  const [userResponse, setUserResponse] = useState("");

  // create a ref hook to hold the chat history container element(for auto scrolling)
  const chatHistoryContainerRef = useRef(null);

  //autoscrolling in chathistory container (learning new)
  useEffect(() => {
    // use effect is trigggered everytime chat history updates
    //checkes is chatHistoryContainerRef is attatched to the dom
    //adjuest the containers current scroll position to total height of container, new messages are then auto scrolled into view
    if (chatHistoryContainerRef.current) {
      chatHistoryContainerRef.current.scrollTop =
        chatHistoryContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  /* -------------------------------------------------------------------------- */
  /*                   MESSAGE SUBMISSION FUNCTION                              */
  /*     purpose = sends users response to the api and updates chat history     */
  /* -------------------------------------------------------------------------- */

  const handleSubmission = async (e) => {
    e.preventDefault();
    // send post request with user input
    try {
      const response = await axios.post("http://localhost:5001/api/interview", {
        userResponse,
      });

      // update chat history state
      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        { role: "user", text: userResponse },
        { role: "ai", text: response.data.aiResponse },
      ]);

      // clear userResponse to reset the inpout field
      setUserResponse("");
    } catch (error) {
      console.error(
        "❌ Error sending response:",
        error.response ? error.response.data : error.message
      );
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                           START TINA FUNCTION                              */
  /* -------------------------------------------------------------------------- */

  const handleStartTina = async () => {
    // sends axiosrequest to "start"
    try {
      const response = await axios.post(
        "http://localhost:5001/api/startInterview"
      );

      // updates chat history with the opening message
      if (response.data?.aiResponse) {
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
          alt="Turners logo"
        />
        <h1 className={styles.heading}>Meet Tina</h1>
        <h2 className={styles.subheading}>
          Your AI Insurance Policy Assistant
        </h2>

        {/* start the chat with tina button */}
        {chatHistory.length === 0 && (
          <button onClick={handleStartTina} className={styles.startButton}>
            Start Chatting to Tina
          </button>
        )}

        {/* chat history displaying */}
        {chatHistory.length > 0 && (
          <div
            className={styles.chatHistoryContainer}
            ref={chatHistoryContainerRef}
          >
            {chatHistory.map((entry, index) => (
              <div key={index} className={styles.role}>
                <strong>{entry.role === "user" ? "You" : "Tina"}</strong>
                <span>{entry.text}</span>
              </div>
            ))}
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
          alt="Tina"
        />
      </div>
    </>
  );
}

export default InsuranceRec;
