from bs4 import BeautifulSoup


def inject_image_annotations(html_files, images, annotations):
    for image in images:
        try:
            image_annotation = filter(lambda a: a.image == image, annotations).__next__()
            html_file = filter(lambda h: h.path == image.location, html_files).__next__()
        except StopIteration:
            pass
        else:
            html_content = open(html_file)
            data = BeautifulSoup(html_content, 'html.parser')
            images_in_html = data.find_all('img', src=True)
            for im in images_in_html:
                if im['src'] == image.filename:
                    im['alt'] = image_annotation

            with open(html_file, "w") as file:
                file.write(str(data))
