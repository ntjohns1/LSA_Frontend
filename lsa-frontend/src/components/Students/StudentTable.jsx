import React, { useEffect, useState } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Container, Card, Toast, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import config from '../../config';
import Loading from '../../helpers/Loading';


export default function StudentTable() {
    // populate table with list of students
    const { authState, oktaAuth } = useOktaAuth();
    const [students, setStudents] = useState([]);
    const [studentFetchFailed, setStudentFetchFailed] = useState(false);

    useEffect(() => {
        if (authState && authState.isAuthenticated) {
            const accessToken = oktaAuth.getAccessToken();
            fetch(config.resourceServer.userAdminUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        setStudentFetchFailed(true);
                        return Promise.reject();
                    }
                    return response.json();
                })
                .then((data) => {
                    const res = data.map((s) => {
                        return {
                            id: s.id,
                            displayName: s.profile.displayName,
                            email: s.profile.email
                        };
                    });
                    setStudents(res);
                    setStudentFetchFailed(false);
                })
                .catch((err) => {
                    setStudentFetchFailed(true);
                    console.error(err);
                });
        }
    }, [authState, oktaAuth]);

    function goToStudent(studentId) {
        document.location.replace(`/students/${studentId}`);
    }

    return (
        <Container className='d-flex justify-content-center'>
            {studentFetchFailed && <Alert>Failed to fetch student</Alert>}
            {students.length != 0 ? (
                <Card>
                    <Card.Header>
                        <h4>Students</h4>
                    </Card.Header>
                    <Card.Body>
                        {students && students.map((student) => (
                            <Toast onClick={() => goToStudent(student.id)} key={student.id}>
                                <Toast.Header closeButton={false}>
                                    <strong className="me-auto">{student.displayName}</strong>
                                </Toast.Header>
                            </Toast>
                        ))}
                    </Card.Body>
                    <Card.Footer>
                        <Button as={Link} to='/addStudent' >New Student</Button>
                    </Card.Footer>
                </Card>
            ) : (
                <Loading />
            )}
        </Container>
    )
}