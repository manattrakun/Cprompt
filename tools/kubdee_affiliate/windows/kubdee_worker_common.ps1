function Resolve-KubdeePython {
    param(
        [string]$Python = ""
    )

    if ($Python) {
        $configured = Get-Command $Python -ErrorAction SilentlyContinue
        if ($configured) {
            return $Python
        }

        if ($Python -eq "py") {
            $fallback = Get-Command "python" -ErrorAction SilentlyContinue
            if ($fallback) {
                return "python"
            }
        }

        throw "Python command not found: $Python. Install Python 3.9+ and enable the py launcher or add python.exe to PATH."
    }

    foreach ($candidate in @("py", "python")) {
        $resolved = Get-Command $candidate -ErrorAction SilentlyContinue
        if ($resolved) {
            return $candidate
        }
    }

    throw "Python not found. Install Python 3.9+ and enable the py launcher or add python.exe to PATH."
}
