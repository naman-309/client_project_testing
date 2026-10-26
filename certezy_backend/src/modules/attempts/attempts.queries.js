// src/modules/attempts/attempts.queries.js

import { pool } from '../../config/db.js'

// ── Create attempt (start) ─────────────────────────────────────────────────
const createAttempt = ({ user_id, test_id, attempt_number }) =>
  pool.query(
    `INSERT INTO test_attempts (user_id, test_id, attempt_number)
     VALUES (?, ?, ?)`,
    [user_id, test_id, attempt_number]
  )

// ── Get attempt by ID ──────────────────────────────────────────────────────
const getAttemptById = (id) => pool.query(`SELECT * FROM test_attempts WHERE id = ? LIMIT 1`, [id])

// ── Get attempt count (for attempt_number) ─────────────────────────────────
const getAttemptCount = (user_id, test_id) =>
  pool.query(
    `SELECT COUNT(*) AS total FROM test_attempts
     WHERE user_id = ? AND test_id = ?`,
    [user_id, test_id]
  )

// ── Complete attempt (submit) ──────────────────────────────────────────────
const completeAttempt = (id, { score, total_marks, obtained_marks, time_taken, is_passed }) =>
  pool.query(
    `UPDATE test_attempts
     SET score = ?, total_marks = ?, obtained_marks = ?,
         time_taken = ?, is_passed = ?, completed_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [score, total_marks, obtained_marks, time_taken, is_passed, id]
  )

// ── Bulk insert attempt answers ────────────────────────────────────────────
const insertAttemptAnswers = (answers) => {
  const values = answers.map((a) => [a.attempt_id, a.question_id, a.selected_opts, a.is_correct])
  return pool.query(
    `INSERT INTO attempt_answers (attempt_id, question_id, selected_opts, is_correct)
     VALUES ?`,
    [values]
  )
}

// ── Get attempt history by user + test ────────────────────────────────────
const getAttemptsByUserAndTest = (user_id, test_id) =>
  pool.query(
    `SELECT
       id, user_id, test_id, attempt_number, score,
       total_marks, obtained_marks, time_taken, is_passed,
       started_at, completed_at
     FROM test_attempts
     WHERE user_id = ? AND test_id = ?
     ORDER BY attempt_number DESC`,
    [user_id, test_id]
  )

// ── Get attempt answers with explanation ──────────────────────────────────
const getAttemptAnswers = (attempt_id) =>
  pool.query(
    `SELECT
       aa.id, aa.question_id, aa.selected_opts, aa.is_correct,
       q.question, q.explanation, q.type,
       o.id AS option_id, o.option_text, o.is_correct AS option_correct, o.order_num
     FROM attempt_answers aa
     JOIN questions q ON q.id = aa.question_id
     LEFT JOIN options o ON o.question_id = aa.question_id
     WHERE aa.attempt_id = ?
     ORDER BY q.order_num ASC, o.order_num ASC`,
    [attempt_id]
  )

// ── Get all attempts by user ───────────────────────────────────────────────
const getAttemptsByUserId = (user_id) =>
  pool.query(
    `SELECT
       ta.id, ta.user_id, ta.test_id, ta.attempt_number, ta.score,
       ta.total_marks, ta.obtained_marks, ta.time_taken, ta.is_passed,
       ta.started_at, ta.completed_at,
       t.title AS test_title, t.type AS test_type, t.pass_percentage,
       c.id AS course_id, c.title AS course_title
     FROM test_attempts ta
     JOIN tests t ON t.id = ta.test_id
     LEFT JOIN courses c ON c.id = t.course_id
     WHERE ta.user_id = ? AND ta.completed_at IS NOT NULL
     ORDER BY ta.completed_at DESC`,
    [user_id]
  )

export {
  createAttempt,
  getAttemptById,
  getAttemptCount,
  completeAttempt,
  insertAttemptAnswers,
  getAttemptsByUserAndTest,
  getAttemptAnswers,
  getAttemptsByUserId,
}
