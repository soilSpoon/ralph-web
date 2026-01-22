import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PTYRunner } from "./pty-runner";

// Mock node-pty
const mockPtyProcess = {
  onData: vi.fn(),
  onExit: vi.fn(),
  write: vi.fn(),
  kill: vi.fn(),
  resize: vi.fn(),
};

const mockSpawn = vi.fn().mockReturnValue(mockPtyProcess);

vi.mock("node-pty", () => ({
  default: {
    spawn: mockSpawn,
  },
  spawn: mockSpawn,
}));

describe("PTYRunner", () => {
  let runner: PTYRunner;

  beforeEach(() => {
    runner = new PTYRunner();
    mockPtyProcess.onData.mockClear();
    mockPtyProcess.onExit.mockClear();
    mockPtyProcess.write.mockClear();
    mockPtyProcess.kill.mockClear();
    mockPtyProcess.resize.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should spawn a process correctly", async () => {
    const onData = vi.fn();
    const onExit = vi.fn();

    await runner.spawn({
      id: "test-session",
      providerId: "gemini",
      cwd: "/tmp",
      prompt: "echo hello",
      onData,
      onExit,
    });

    expect(mockSpawn).toHaveBeenCalled();
    expect(mockPtyProcess.onData).toHaveBeenCalled();
    expect(mockPtyProcess.onExit).toHaveBeenCalled();
  });

  it("should handle data events", async () => {
    const onData = vi.fn();
    const onExit = vi.fn();

    await runner.spawn({
      id: "test-session",
      providerId: "gemini",
      cwd: "/tmp",
      prompt: "echo hello",
      onData,
      onExit,
    });

    // Simulate data event
    const dataCallback = mockPtyProcess.onData.mock.calls[0][0];
    dataCallback("hello world");

    expect(onData).toHaveBeenCalledWith("hello world");
  });

  it("should detect completion signal and kill process", async () => {
    const onData = vi.fn();
    const onExit = vi.fn();

    await runner.spawn({
      id: "test-session",
      providerId: "gemini",
      cwd: "/tmp",
      prompt: "echo hello",
      onData,
      onExit,
    });

    // Simulate completion signal
    const dataCallback = mockPtyProcess.onData.mock.calls[0][0];
    dataCallback("Some output\n<promise>COMPLETE</promise>\nMore output");

    expect(onData).toHaveBeenCalled();

    // Wait for the timeout in pty-runner (500ms), giving it a bit more buffer (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(mockPtyProcess.kill).toHaveBeenCalled();
  });

  it("should write to the process", async () => {
    await runner.spawn({
      id: "test-session",
      providerId: "gemini",
      cwd: "/tmp",
      prompt: "echo hello",
      onData: vi.fn(),
      onExit: vi.fn(),
    });

    runner.write("test-session", "input data");
    expect(mockPtyProcess.write).toHaveBeenCalledWith("input data");
  });

  it("should resize the process", async () => {
    await runner.spawn({
      id: "test-session",
      providerId: "gemini",
      cwd: "/tmp",
      prompt: "echo hello",
      onData: vi.fn(),
      onExit: vi.fn(),
    });

    runner.resize("test-session", 100, 50);
    expect(mockPtyProcess.resize).toHaveBeenCalledWith(100, 50);
  });

  it("should handle process exit", async () => {
    const onExit = vi.fn();

    await runner.spawn({
      id: "test-session",
      providerId: "gemini",
      cwd: "/tmp",
      prompt: "echo hello",
      onData: vi.fn(),
      onExit,
    });

    // Simulate exit event
    const exitCallback = mockPtyProcess.onExit.mock.calls[0][0];
    exitCallback({ exitCode: 0, signal: undefined });

    expect(onExit).toHaveBeenCalledWith(0, undefined);
  });
});
