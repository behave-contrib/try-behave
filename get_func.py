file_lines = ["line 1",
              "@step('I do stuff')",
              "def do_stuff(context):",
              "    pass",
              "\n"
              "\n",
              "line_7",
              "line_8",
              "line_9"]
line_no = 2
func_to_end = file_lines[int(line_no):]
func_lines = []
for i in range(len(func_to_end) -1):
    if len(func_to_end[i].strip()) == 0:
        if i + 1 < len(func_to_end):
            if len(func_to_end[i].strip()) == 0:
                break
    func_lines.append(func_to_end[i])
print(func_lines)