"""
Python code execution module for the Drive application.
This is a prototype implementation without security limitations.
"""

import subprocess
import tempfile
import os
import io
import sys
from contextlib import redirect_stdout, redirect_stderr


def execute_python_code(code_content):
    """
    Execute Python code and return the results.

    Args:
        code_content (str): The Python code to execute

    Returns:
        dict: A dictionary containing execution results
            - output: Standard output from execution
            - error: Standard error from execution
            - exit_code: The exit code of the execution
    """
    with tempfile.NamedTemporaryFile(suffix='.py', delete=False) as temp_file:
        temp_filename = temp_file.name
        temp_file.write(code_content.encode('utf-8'))

    output_buffer = io.StringIO()
    error_buffer = io.StringIO()

    try:
        with redirect_stdout(output_buffer), redirect_stderr(error_buffer):
            result = subprocess.run(
                [sys.executable, temp_filename],
                capture_output=True,
                text=True,
                timeout=30
            )

        return {
            'output': result.stdout,
            'error': result.stderr,
            'exit_code': result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            'output': '',
            'error': 'Execution timed out after 30 seconds',
            'exit_code': 124
        }
    except Exception as e:
        return {
            'output': '',
            'error': f'Execution failed: {str(e)}',
            'exit_code': 1
        }
    finally:
        try:
            os.unlink(temp_filename)
        except:
            pass
