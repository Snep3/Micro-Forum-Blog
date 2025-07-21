import React, { useEffect, useState } from "react";
import axios from "axios";
import "./postsPage.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import notTwitterLogo from "../images/notTwitter.png";

const API_URL = "http://localhost:5000";

export default function PostsPage({ token, onLogout }) {
  const [userId, setUserId] = useState("");
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [comments, setComments] = useState({}); // comments by post
  const [newComments, setNewComments] = useState({}); // new comments by posts
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [visibleComments, setVisibleComments] = useState({}); // visible comments

  //get user ID from token
  useEffect(() => {
    if (token) {
      // Decode the token to get user ID
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserId(decoded.id);
    }
  }, [token]);

  
  useEffect(() => {
    axios
    // fetch posts from the server
      .get(`${API_URL}/posts`)
      // sort them by date
      .then((res) => setPosts(res.data))
      .catch((err) => {
        console.error(err);
        setError("error loading posts.");
        clearMessage();
      });
  }, []);

  //clear message after 10 seconds
  const clearMessage = () => {
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 10000);
  };

  //create post
  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
    setError("Please fill in both title and content.");
    clearMessage();
    return;
  }
    try {
      // create a new post with the given { title, content }
      const res = await axios.post(`${API_URL}/posts`, newPost, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // add the new post to the posts list
      // and reset the newPost state
      setPosts([res.data, ...posts]);
      setNewPost({ title: "", content: "" });
      setMessage("Post Created successfully! :D");
      clearMessage();
    } catch (err) {
      console.error(err);
      setError("Could not create post :(");
      clearMessage();
    }
  };

  //delete post
  const deletePost = async (id) => {
    try {
      // delete the post with the given id
      await axios.delete(`${API_URL}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      setError("Error deleting post.");
      clearMessage();
    }
  };

  //update post
  const updatePost = async (id) => {
    // prompt user for new title and content
    const title = prompt("New Title:");
    const content = prompt("New Content:");
    try {
      // update the post with the given id
      const res = await axios.put(
        `${API_URL}/posts/${id}`,
        // send the new title and content given by the prompts
        { title, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setPosts(posts.map((p) => (p._id === id ? res.data : p)));
    } catch (err) {
      console.error(err);
      setError("Error updating post.");
      clearMessage();
    }
  };

  //load comments for a post
  const loadComments = async (postId) => {
    try {
      // fetch comments for the post with the given id
      const res = await axios.get(`${API_URL}/comments/${postId}`);
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };
  //fetch comments when post is clicked
  const toggleComments = async (postId) => {
    // toggle visibility of comments for the post
    const currentlyVisible = visibleComments[postId];
    if (currentlyVisible) {
      setVisibleComments((prev) => ({ ...prev, [postId]: false }));
    } else {
      await loadComments(postId);
      setVisibleComments((prev) => ({ ...prev, [postId]: true }));
    }
  };

  //handle comment change
  const handleCommentChange = (postId, value) => {
    setNewComments((prev) => ({ ...prev, [postId]: value }));
  };

  //submit comment
  const submitComment = async (postId) => {
    try {
      const res = await axios.post(
        `${API_URL}/comments`,
        {
          content: newComments[postId],
          postId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComments((prev) => ({
        ...prev,
        [postId]: [res.data, ...(prev[postId] || [])],
      }));

      setNewComments((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error(err);
      setError("Error submitting comment.");
      clearMessage();
    }
  };

  return (
    //background
    <div
      className="PostsPage "
      style={{
        background: "linear-gradient(145deg, #0c1c2e, #060e1a)",
        minHeight: "100vh",
      }}
    >
      <div className="PostsHeader d-flex justify-content-between p-3">
        <div className="logo d-flex align-items-center gap-2 ms-2">
          <img src={notTwitterLogo} />
          <p className="mt-3 text-light fw-bold fs-5">WorseTwitter</p>
        </div>

        <div className="menu">
          <button
            className="logout_btn btn btn-outline-light"
            onClick={onLogout}
          >
            <i className="bi bi-box-arrow-left me-2"></i>Logout
          </button>
        </div>
      </div>

      {/* New Post */}
      <div className="Card d-flex flex-column justify-content-center align-items-center ">
        <div
          className="NewPosts card p-5 rounded-5 text-light shadow-lg m-5"
          style={{
            backgroundColor: "#1b2735",
            width: "100%",
            maxWidth: "1500px",
            minHeight: "300px",
          }}
        >
          <h2 className="mb-3 fw-bold">Create Post</h2>
          <input
            className="mb-4 input-group-text border-0 rounded-3 text-start w-100"
            style={{ backgroundColor: "#1e2d44", color: "#9bafcdff" }}
            placeholder="Header.."
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <textarea
            className="mb-4 input-group-text border-0 rounded-3 text-start w-100"
            style={{
              backgroundColor: "#1e2d44",
              color: "#9bafcdff",
              whiteSpace: "pre-wrap",
            }}
            placeholder="Whats on your mind?.. 🤔"
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
          />
          <button
            className="publish_btn p-2 ps-3 pe-3 w-100 w-md-25"
            onClick={createPost}
          >
            {" "}
            + Publish Post
          </button>
          {/* Show error and success messages */}
          {message && <div style={{ color: "#5c875c" }}>{message}</div>}
          {error && <div style={{ color: "#845151" }}>{error}</div>}
        </div>

        {/* Posts */}
        {posts.map((post) => (
          <div
            key={post._id}
            className="Post card p-4 rounded-5 text-light shadow-lg m-5 mt-0"
            style={{
              backgroundColor: "#1b2735",
              width: "100%",
              maxWidth: "1500px",
              minHeight: "200px",
            }}
          >
            <div
              className="border-0 rounded-3 p-3 "
              style={{
                backgroundColor: "#1e2d44",
                color: "#9bafcdff",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              <div className="PostHeader d-flex fw-bold">
                <h3 className="fw-bold">{post.title}</h3>
                <small className="p-2 text-nowrap" style={{ color: "#526685" }}>
                  {post.author?.username}
                </small>
              </div>

              <p className="text-light">{post.content}</p>
            </div>

            <div className="btn_border mt-3 mb-3" />

            <div className="btns d-flex justify-content-between">
              {/* show/hide comments */}
              <div>
                <button
                  className="posts_btn bi bi-chat-dots"
                  onClick={() => toggleComments(post._id)}
                >
                  {visibleComments[post._id]
                    ? " Hide Comments"
                    : " Show Comments"}
                </button>
              </div>
                    
              {post.author && post.author._id === userId && (
                <div className="d-flex gap-3">
                  <button
                    className="posts_btn"
                    onClick={() => updatePost(post._id)}
                  >
                    <i className="bi bi-pencil me-2"></i>Edit
                  </button>
                  <button
                    className="posts_btn"
                    onClick={() => deletePost(post._id)}
                  >
                    <i className="bi bi-trash3 me-2"></i>Delete
                  </button>
                </div>
              )}
            </div>

            {/* show if visible comments*/}
            {visibleComments[post._id] && (
              <div style={{ marginTop: "1rem" }}>
                {comments[post._id] && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <h4 className="fw-bold">Comments:</h4>

                    <div className="new-comment d-flex gap-2">
                      <textarea
                        className="mb-4 input-group-text border-0 rounded-3 text-start w-100"
                        style={{
                          backgroundColor: "#1e2d44",
                          color: "#9bafcdff",
                          whiteSpace: "pre-wrap",
                        }}
                        rows="2"
                        placeholder="Add a comment..."
                        value={newComments[post._id] || ""}
                        onChange={(e) =>
                          handleCommentChange(post._id, e.target.value)
                        }
                      />

                      <button
                        className="publish_btn btn btn-sm mb-4"
                        onClick={() => submitComment(post._id)}
                      >
                        Send Comment
                      </button>
                    </div>

                    {comments[post._id].length === 0 ? (
                      <p>No Commends Yet..</p>
                    ) : (
                      comments[post._id].map((c) => (
                        <div
                          key={c._id}
                          className="Comment mb-4 p-3 border-0 rounded-3 d-flex flex-column align-items-start w-100"
                          style={{
                            backgroundColor: "#1e2d44",
                            color: "#9bafcdff",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          <strong dir="auto">{c.author?.username}: </strong>
                          <div
                            dir="auto"
                            className="text-light"
                            style={{
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          >
                            {c.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
