from behave.formatter.pretty import PrettyFormatter
from behave.textutil import indent


class SimplePrettyFormatter(PrettyFormatter):

    def __init__(self, stream_opener, config):
        config.show_multiline = False
        super().__init__(stream_opener, config)

    # -- DISABLE: Step replay.
    def result(self, step):
        if not self.monochrome:
            lines = self.step_lines + 1
            if self.show_multiline:
                if step.table:
                    lines += len(step.table.rows) + 1
                if step.text:
                    lines += len(step.text.splitlines()) + 2
            arguments = []
            location = None
            if self._match:
                arguments = self._match.arguments
                location = self._match.location
            self.print_step(step.status, arguments, location, True)
        if step.error_message:
            self.stream.write(indent(step.error_message.strip(), "      "))
            self.stream.write("\n\n")
        self.stream.flush()
