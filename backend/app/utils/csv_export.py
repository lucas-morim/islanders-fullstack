import csv
import io
from typing import Iterable, Callable, Sequence
from fastapi.responses import StreamingResponse

def stream_csv(
    filename: str,
    header: Sequence[str],
    rows: Iterable,
    row_mapper: Callable[[object], Sequence[object]],
    delimiter: str = ";",
):
    def iter_csv():
        yield "\ufeff" 

        output = io.StringIO()
        writer = csv.writer(output, delimiter=delimiter)

        writer.writerow(header)

        for item in rows:
            writer.writerow(row_mapper(item))

        yield output.getvalue()
        output.close()

    return StreamingResponse(
        iter_csv(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
