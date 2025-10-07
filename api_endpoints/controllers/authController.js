import supabase from "../utils/supabaseClient.js";

// SIGNUP
export const signup = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (signUpError) throw signUpError;

    const userId = user.user.id;

    const { error: profileError } = await supabase.from("Account").insert([
      { account_id: userId, username, email, role },
    ]);

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({
        step: "account",
        error: profileError.message,
        rollback: "User deleted from Auth",
      });
    }

    res.status(200).json({ message: "User created successfully", user: user.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.status(200).json({ message: "Login successful", session: data.session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// AUTH ME
export const authMe = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) throw error;

    res.status(200).json({ user: data.user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(400).json({ error: "Refresh token is required" });

  try {
    // Exchange refresh token for new session
    const { data, error } = await supabase.auth.api.refreshAccessToken(refreshToken);

    if (error) return res.status(401).json({ error: error.message });

    res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      user: data.user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


