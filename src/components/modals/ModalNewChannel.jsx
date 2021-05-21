import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Form, Button } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useSocket, useUser } from '../../hooks/index.jsx';
import { closeModal } from '../../slices/modalsSlice.js';

const ModalNewChannel = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const inputRef = useRef();
  const { isOpened, type } = useSelector((state) => state.modals);
  const { user: { username } } = useUser();
  const { channels } = useSelector((state) => state.channels);
  const channelsName = channels.map(({ name }) => name);
  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required().min(3).max(20)
        .notOneOf(channelsName),
    }),
    onSubmit: (values, actions) => {
      const channel = { user: username, name: values.name };
      socket.emit('newChannel', channel, (res) => {
        if (res.status === 'ok') {
          dispatch(closeModal());
          actions.resetForm();
        } else {
          throw new Error('Error network!');
        }
      });
    },
  });

  useEffect(() => {
    inputRef.current.focus();
  });

  const modalCloseHandler = () => {
    dispatch(closeModal());
  };

  return (
    <Modal show={isOpened && type === 'newChannel'} onHide={modalCloseHandler}>
      <Modal.Header closeButton>
        <Modal.Title>Добавить канал</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={formik.handleSubmit}>
          <Form.Group>
            <Form.Control
              type="text"
              name="name"
              onChange={formik.handleChange}
              value={formik.values.name}
              isInvalid={formik.errors.name}
              disabled={formik.isSubmitting}
              ref={inputRef}
            />
            <Form.Control.Feedback type="invalid">{formik.errors.name}</Form.Control.Feedback>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button
              type="button"
              className="mr-2"
              variant="secondary"
              onClick={modalCloseHandler}
            >
              Отменить
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
            >
              Отправить
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalNewChannel;