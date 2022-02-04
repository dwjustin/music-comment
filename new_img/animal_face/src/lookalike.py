import os
import face_recognition
import numpy as np
import matplotlib.pyplot as plt

dir_path = os.getenv('HOME') + '/Desktop/GitHub Repository/similar_species/img'
file_list = os.listdir(dir_path)
# print(file_list)


def get_cropped_face(img_file):
    image = face_recognition.load_image_file(img_file)
    face_locations = face_recognition.face_locations(image)
    if len(face_locations) == 1:
        a, b, c, d = face_locations[0]
        cropped = image[a:c, d:b, :]
        return cropped
    elif len(face_locations) > 1:
        raise ValueError('Too many faces')
    else:
        raise ValueError('No face detected')


def get_face_embedding(face):
    return face_recognition.face_encodings(face)


# embedding dict 만드는 함수
def get_face_embedding_dict(dir_path):
    # file_list = os.listdir(dir_path)
    embedding_dict = {}
    cropped_dict = {}

    for file in file_list:
        img_path = os.path.join(dir_path, file)
        face = get_cropped_face(img_path)
        if face == []:
            continue
        embedding = get_face_embedding(face)
        if len(embedding) > 0:
            # splitext = file, extension
            embedding_dict[os.path.splitext(file)[0]] = embedding[0]
            cropped_dict[os.path.splitext(file)[0]] = face

    return embedding_dict, cropped_dict


# 두 얼굴 사이의 거리 구하기
def get_distance(name1, name2):
    return np.linalg.norm(embedding_dict[name1] - embedding_dict[name2], ord=2)


# name1과 name2의 거리를 비교하는 함수
def get_sort_key_func(name1):
    def get_distance_from_name1(name2):
        return get_distance(name1, name2)

    return get_distance_from_name1


def get_nearest_face(sort_key_func, top=3):
    # sort_key_func = get_sort_key_func(name)
    sorted_faces = sorted(embedding_dict.items(), key=lambda x: sort_key_func(x[0]))

    for i in range(top + 1):
        if i == 0:
            continue
        if sorted_faces[i]:
            print(f'순위 {i} : 이름 ({sorted_faces[i][0]}), 거리({sort_key_func(sorted_faces[i][0])})')
    return sorted_faces


embedding_dict, cropped_dict = get_face_embedding_dict(dir_path)

input_path = dir_path # temporally


image_file = os.path.join(input_path, '제니.ㅓㅔㅎ')
cropped_face = get_cropped_face(image_file)

input_embedding = get_face_embedding(cropped_face)

# 거리를 비교할 name1 지정 - 추후 입력값으로 수정
sort_key_func = get_sort_key_func('제니')

# 순위 출력
sorted_faces = get_nearest_face('제니')


# 순위에 맞는 이미지 출력
def get_nearest_face_images(sorted_faces, top=3):
    fig = plt.figure(figsize=(5, 3))
    fig.add_subplot(2, top, 1)
    plt.imshow(cropped_dict[sorted_faces[0][0]])
    for i in range(1, top+1):
        fig.add_subplot(2, top, i+3)
        plt.imshow(cropped_dict[sorted_faces[i][0]])


# 순위에 따른 이미지 출력
get_nearest_face_images(sorted_faces)