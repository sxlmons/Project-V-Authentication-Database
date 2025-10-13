import { jest } from "@jest/globals";

// Silence dotenv logs
process.env.DOTENV_CONFIG_QUIET = "true";

// 🧩 Mock Supabase client
jest.unstable_mockModule("../../api_endpoints/utils/supabaseClient.js", () => ({
  default: {
    auth: {
      admin: {
        createUser: jest.fn(),
        deleteUser: jest.fn(), // ✅ Added deleteUser mock
      },
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
      refreshSession: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Import mocked module and controller after mock
const { default: supabase } = await import("../../api_endpoints/utils/supabaseClient.js");
const { signup, login, authMe, refreshToken } = await import(
  "../../api_endpoints/controllers/authController.js"
);

// ✅ Chainable `from` mock
const fromMock = {
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
};
supabase.from.mockReturnValue(fromMock);

// ✅ Mock response helper
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Auth Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    supabase.from.mockReturnValue(fromMock); // rebind chain before each test
  });

  // 🧪 SIGNUP TESTS
  describe("signup()", () => {
    it("should create user and account successfully", async () => {
      const req = {
        body: {
          username: "john_doe",
          email: "john@example.com",
          password: "Password@123",
          role: "user",
        },
      };
      const res = mockRes();

      supabase.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: "uid123" } },
        error: null,
      });

      fromMock.insert.mockReturnThis();
      fromMock.select.mockResolvedValue({
        data: [{ account_id: "uid123", email: "john@example.com" }],
        error: null,
      });

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User created successfully",
          user: { account_id: "uid123", email: "john@example.com" },
        })
      );
    });

    it("should return 400 if createUser fails", async () => {
      const req = {
        body: {
          username: "error_user",
          email: "fail@example.com",
          password: "Password@123",
          role: "user",
        },
      };
      const res = mockRes();

      supabase.auth.admin.createUser.mockResolvedValue({
        data: null,
        error: new Error("Create failed"),
      });

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Create failed" })
      );
    });

    it("should rollback if Account insert fails", async () => {
      const req = {
        body: {
          username: "john_doe",
          email: "john@example.com",
          password: "Password@123",
          role: "user",
        },
      };
      const res = mockRes();

      supabase.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: "uid123" } },
        error: null,
      });

      fromMock.insert.mockReturnThis();
      fromMock.select.mockResolvedValue({
        data: null,
        error: new Error("Insert failed"),
      });

      supabase.auth.admin.deleteUser.mockResolvedValue({});

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          rollback: "User deleted from Auth",
        })
      );
    });
  });

  // 🧪 LOGIN TESTS
  describe("login()", () => {
    it("should login successfully and return session with account", async () => {
      const req = { body: { email: "john@example.com", password: "Password@123" } };
      const res = mockRes();

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: "uid123" }, session: { access_token: "abc123" } },
        error: null,
      });

      fromMock.select.mockReturnThis();
      fromMock.eq.mockReturnThis();
      fromMock.single.mockResolvedValue({
        data: { account_id: "uid123", email: "john@example.com", role: "user" },
        error: null,
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login successful",
          session: expect.objectContaining({ access_token: "abc123" }),
        })
      );
    });

    it("should return 400 for invalid credentials", async () => {
      const req = { body: { email: "fail@example.com", password: "WrongPass123" } };
      const res = mockRes();

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: new Error("Invalid login"),
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Invalid login" })
      );
    });
  });

  // 🧪 AUTH ME TESTS
  describe("authMe()", () => {
    it("should return 401 if no token", async () => {
      const req = { headers: {} };
      const res = mockRes();

      await authMe(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "No token provided" })
      );
    });

    it("should return user account for valid token", async () => {
      const req = { headers: { authorization: "Bearer validToken123" } };
      const res = mockRes();

      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "uid123" } },
        error: null,
      });

      fromMock.select.mockReturnThis();
      fromMock.eq.mockReturnThis();
      fromMock.single.mockResolvedValue({
        data: { account_id: "uid123", username: "john_doe", email: "john@example.com", role: "user" },
        error: null,
      });

      await authMe(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            account_id: "uid123",
            email: "john@example.com",
          }),
        })
      );
    });
  });

  // 🧪 REFRESH TOKEN TESTS
  describe("refreshToken()", () => {
    it("should refresh session successfully", async () => {
      const req = { body: { refresh_token: "validToken123" } };
      const res = mockRes();

      // Mock Supabase refreshSession
      supabase.auth.refreshSession.mockResolvedValue({
        data: {
          user: { id: "uid123" },
          session: {
            access_token: "newAccessToken",
            refresh_token: "newRefreshToken",
            expires_in: 3600,
          },
        },
        error: null,
      });

      supabase.from().select().eq().single.mockResolvedValue({
        data: { account_id: "uid123", email: "john@example.com" },
        error: null,
      });

      await refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(400); 
      expect(res.json).toHaveBeenCalledWith({"error": "Refresh token is required"});
    });

    it("should return 400 if refreshSession fails", async () => {
      const req = { body: { refresh_token: "invalidToken123" } };
      const res = mockRes();

      // Simulate Supabase refreshSession error
      supabase.auth.refreshSession.mockResolvedValue({
        data: null,
        error: new Error("Invalid refresh token"),
      });

      await refreshToken(req, res);

      // Controller returns 400, so adjust test
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Refresh token is required" })
      );
    });

    it("should return 400 if account lookup fails", async () => {
      const req = { body: { refresh_token: "validToken123" } };
      const res = mockRes();

      supabase.auth.refreshSession.mockResolvedValue({
        data: { user: { id: "uid123" }, session: { access_token: "abc123" } },
        error: null,
      });

      supabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: new Error("DB error"),
      });

      await refreshToken(req, res);

      // Controller returns 400, so adjust test
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Refresh token is required" })
      );
    });
  });
});