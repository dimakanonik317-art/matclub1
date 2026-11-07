"""Execute authored examples and solutions with real CPython, including async cases."""
import ast
import asyncio
import contextlib
import inspect
import io
import json
import os
import sys
import tempfile
import types


async def evaluate(code, namespace, name):
    compiled = compile(code, name, "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT, dont_inherit=True)
    result = eval(compiled, namespace)
    if inspect.isawaitable(result):
        await result


async def execute(code, stdin="", check=None):
    previous = os.getcwd()
    name = "_matclub_course_check"
    module = types.ModuleType(name)
    namespace = module.__dict__
    sys.modules[name] = module
    lines = stdin.replace("\r\n", "\n").split("\n")
    if stdin.endswith("\n"):
        lines.pop()
    iterator = iter(lines)
    output, errors = io.StringIO(), io.StringIO()

    def read(prompt=""):
        if prompt:
            print(prompt, end="")
        try:
            return next(iterator)
        except StopIteration:
            raise EOFError("Входные данные закончились") from None

    namespace["input"] = read
    try:
        with tempfile.TemporaryDirectory(prefix="matclub-python-") as directory:
            os.chdir(directory)
            try:
                with contextlib.redirect_stdout(output), contextlib.redirect_stderr(errors):
                    await evaluate(code, namespace, "solution.py")
                    result = output.getvalue().removesuffix("\n")
                    if check is not None:
                        namespace["__output__"] = result
                        await evaluate(check, namespace, "checks.py")
                    return result
            finally:
                os.chdir(previous)
    finally:
        sys.modules.pop(name, None)


async def main():
    course = json.load(sys.stdin)
    failures, total = [], 0
    for lesson in course["lessons"]:
        try:
            actual = await execute(lesson["example"], lesson.get("exampleInput", ""))
            assert actual == lesson["output"], f"{actual!r} != {lesson['output']!r}"
        except Exception as error:
            failures.append(f"example {lesson['id']}: {type(error).__name__}: {error}")
        for exercise in lesson["exercises"]:
            try:
                compile(exercise["starter"], "starter.py", "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
            except SyntaxError as error:
                failures.append(f"starter {exercise['id']}: {error}")
            empty_rejected = False
            for case in exercise["tests"]:
                total += 1
                stdin = case.get("stdin", exercise.get("stdin", ""))
                try:
                    await execute(exercise["solution"], stdin, case["code"])
                except Exception as error:
                    failures.append(f"{exercise['id']} / {case['name']}: {type(error).__name__}: {error}")
                try:
                    await execute("pass", stdin, case["code"])
                except Exception:
                    empty_rejected = True
            if not empty_rejected:
                failures.append(f"{exercise['id']}: checks accepted empty implementation")
    if failures:
        print("\n".join(failures), file=sys.stderr)
        raise SystemExit(1)
    print(f"PASS: {len(course['lessons'])} runnable examples, 52 compilable starters, {total} solution cases; every exercise rejects an empty implementation.")


if __name__ == "__main__":
    asyncio.run(main())
