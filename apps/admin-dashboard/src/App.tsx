import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Caddies from './pages/Caddies';
import Rounds from './pages/Rounds';
import ListTournament from './pages/ListTournament';
import Customers from './pages/Customers';
import MessageHistory from './pages/MessageHistory';
import CaddieActivities from './pages/CaddieActivities';
import MonitorPopups from './pages/MonitorPopups';
import DeviceMonitoring from './pages/DeviceMonitoring';
import CourseMonitoring from './pages/CourseMonitoring';
import CaddieManage from './pages/CaddieManage';
import CaddiePerformance from './pages/CaddiePerformance';
import CaddieRating from './pages/CaddieRating';
import CaddieOrders from './pages/CaddieOrders';
import SnackBarOrders from './pages/SnackBarOrders';
import GroupRounds from './pages/GroupRounds';
import UserHome from './pages/UserHome';
import UserModeSelection from './pages/UserModeSelection';
import CreateTournament from './pages/CreateTournament';
import TournamentPlayers from './pages/TournamentPlayers';
import TournamentConfiguration from './pages/TournamentConfiguration';
import TournamentRules from './pages/TournamentRules';
import LiveScoreGroup from './pages/LiveScoreGroup';
import TournamentPlayerSelection from './pages/TournamentPlayerSelection';
import TournamentScorecard from './pages/TournamentScorecard';
import LandingPage from './pages/LandingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import LocationSelectionPage from './pages/LocationSelectionPage';
import UserPadangGolfSulaiman from './pages/UserPadangGolfSulaiman';
import UserJatinangorGolf from './pages/UserJatinangorGolf';
import CaddieModeDetail from './pages/CaddieModeDetail';
import RestoMenu from './pages/RestoMenu';
import HoleYardage from './pages/HoleYardage';
import ClubSummary from './pages/ClubSummary';
import CaddieNotes from './pages/CaddieNotes';
import ScorecardView from './pages/ScorecardView';
import GPSMapView from './pages/GPSMapView';
import KioskScorePrint from './pages/KioskScorePrint';
import KioskPrintAction from './pages/KioskPrintAction';
import SystemDebug from './pages/SystemDebug';
import MonitoringScoreTournament from './pages/MonitoringScoreTournament';
import ResetScore from './pages/ResetScore';
import CheckDatabase from './pages/CheckDatabase';

// Portal Akademik Imports
import PortalLayout from './pages/portal-akademik/PortalLayout';
import LoginPage from './pages/portal-akademik/LoginPage';
import StudentDashboard from './pages/portal-akademik/StudentDashboard';
import CoachDashboard from './pages/portal-akademik/CoachDashboard';
import CoachStudents from './pages/portal-akademik/CoachStudents';
import CoachEvaluations from './pages/portal-akademik/CoachEvaluations';
import CoachSchedule from './pages/portal-akademik/CoachSchedule';
import CoachSyllabus from './pages/portal-akademik/CoachSyllabus';
import AdminDashboard from './pages/portal-akademik/AdminDashboard';
import CoachManagement from './pages/portal-akademik/CoachManagement';
import StudentManagement from './pages/portal-akademik/StudentManagement';
import TrainingProgram from './pages/portal-akademik/TrainingProgram';
import SessionTracker from './pages/portal-akademik/SessionTracker';
import Schedule from './pages/portal-akademik/Schedule';
import Messages from './pages/portal-akademik/Messages';
import Profile from './pages/portal-akademik/Profile';
import PerformanceEvaluation from './pages/portal-akademik/PerformanceEvaluation';
import LearningCenter from './pages/portal-akademik/LearningCenter';
import Feedback from './pages/portal-akademik/Feedback';
import Curriculum from './pages/portal-akademik/Curriculum';
import StudentSyllabus from './pages/portal-akademik/StudentSyllabus';
import Reports from './pages/portal-akademik/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/portalakademik" element={<PortalLayout />}>
          <Route index element={<LoginPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="student">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="program" element={<TrainingProgram />} />
            <Route path="syllabus" element={<StudentSyllabus />} />
            <Route path="tracker" element={<SessionTracker />} />
            <Route path="evaluation" element={<PerformanceEvaluation />} />
            <Route path="learning" element={<LearningCenter />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="messages" element={<Messages />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="coach">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CoachDashboard />} />
            <Route path="students" element={<CoachStudents />} />
            <Route path="evaluations" element={<CoachEvaluations />} />
            <Route path="schedule" element={<CoachSchedule />} />
            <Route path="syllabus" element={<CoachSyllabus />} />
            <Route path="messages" element={<Messages />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="admin">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="coaches" element={<CoachManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="curriculum" element={<Curriculum />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>

        {/* Admin Dashboard Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/monitor/course" element={
          <ProtectedRoute>
            <CourseMonitoring />
          </ProtectedRoute>
        } />
        <Route path="/admin/monitor/tournament-score" element={
          <ProtectedRoute>
            <MonitoringScoreTournament />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/caddies" element={<Caddies />} />
                <Route path="/caddies/manage" element={<CaddieManage />} />
                <Route path="/caddies/performance" element={<CaddiePerformance />} />
                <Route path="/caddies/rating" element={<CaddieRating />} />
                <Route path="/caddies/orders" element={<CaddieOrders />} />
                <Route path="/caddies/snack-bar" element={<SnackBarOrders />} />
                <Route path="/rounds" element={<Rounds />} />
                <Route path="/rounds/list-tournament" element={<ListTournament />} />
                <Route path="/rounds/groups" element={<GroupRounds />} />
                <Route path="/rounds/caddie-activities" element={<CaddieActivities />} />
                <Route path="/rounds/create-tournament" element={<CreateTournament />} />
                <Route path="/rounds/tournament-players" element={<TournamentPlayers />} />
                <Route path="/rounds/tournament-configuration" element={<TournamentConfiguration />} />
                <Route path="/rounds/tournament-rules" element={<TournamentRules />} />
                <Route path="/rounds/live-score" element={<LiveScoreGroup />} />
                <Route path="/rounds/course" element={<Rounds />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/message" element={<MessageHistory />} />
                <Route path="/customers/messages" element={<MessageHistory />} />
                <Route path="/monitor/popups" element={<MonitorPopups />} />
                <Route path="/monitor/devices" element={<DeviceMonitoring />} />
                <Route path="/system-debug" element={<SystemDebug />} />
                <Route path="/configuration/reset-score" element={<ResetScore />} />
                <Route path="/configuration/check-database" element={<CheckDatabase />} />
                <Route path="*" element={<div className="text-2xl font-bold">Admin Page Not Found</div>} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/userpalmspringkarawang/*" element={
          <Routes>
            <Route path="/" element={<UserHome />} />
            <Route path="/mode-selection" element={<UserModeSelection />} />
            <Route path="/tournament-selection" element={<TournamentPlayerSelection />} />
            <Route path="/marshall" element={<TournamentPlayerSelection />} />
            <Route path="/updatemarshallscore" element={<TournamentPlayerSelection />} />
            <Route path="/tournament-mode/scorecard" element={<TournamentScorecard />} />
            <Route path="/caddie-mode" element={<CaddieModeDetail />} />
            <Route path="/resto-menu" element={<RestoMenu />} />
            <Route path="/hole-yardage" element={<HoleYardage />} />
            <Route path="/club-summary" element={<ClubSummary />} />
            <Route path="/caddie-notes" element={<CaddieNotes />} />
            <Route path="/scorecard" element={<ScorecardView />} />
            <Route path="/gps-map" element={<GPSMapView />} />
            <Route path="/kiosk/print" element={<KioskScorePrint />} />
            <Route path="/kiosk/action" element={<KioskPrintAction />} />
            <Route path="*" element={<div className="text-2xl font-bold">User Page Not Found</div>} />
          </Routes>
        } />

        <Route path="/userpadanggolfsulaiman/*" element={
          <Routes>
            <Route path="/" element={<UserPadangGolfSulaiman />} />
            <Route path="/mode-selection" element={<UserModeSelection />} />
            <Route path="/tournament-selection" element={<TournamentPlayerSelection />} />
            <Route path="/marshall" element={<TournamentPlayerSelection />} />
            <Route path="/updatemarshallscore" element={<TournamentPlayerSelection />} />
            <Route path="/tournament-mode/scorecard" element={<TournamentScorecard />} />
            <Route path="/caddie-mode" element={<CaddieModeDetail />} />
            <Route path="/resto-menu" element={<RestoMenu />} />
            <Route path="/hole-yardage" element={<HoleYardage />} />
            <Route path="/club-summary" element={<ClubSummary />} />
            <Route path="/caddie-notes" element={<CaddieNotes />} />
            <Route path="/scorecard" element={<ScorecardView />} />
            <Route path="/gps-map" element={<GPSMapView />} />
            <Route path="*" element={<div className="text-2xl font-bold">Page Not Found</div>} />
          </Routes>
        } />

        <Route path="/userjatinangorgolf/*" element={
          <Routes>
            <Route path="/" element={<UserJatinangorGolf />} />
            <Route path="/mode-selection" element={<UserModeSelection />} />
            <Route path="/tournament-selection" element={<TournamentPlayerSelection />} />
            <Route path="/marshall" element={<TournamentPlayerSelection />} />
            <Route path="/updatemarshallscore" element={<TournamentPlayerSelection />} />
            <Route path="/tournament-mode/scorecard" element={<TournamentScorecard />} />
            <Route path="/caddie-mode" element={<CaddieModeDetail />} />
            <Route path="/resto-menu" element={<RestoMenu />} />
            <Route path="/hole-yardage" element={<HoleYardage />} />
            <Route path="/club-summary" element={<ClubSummary />} />
            <Route path="/caddie-notes" element={<CaddieNotes />} />
            <Route path="/scorecard" element={<ScorecardView />} />
            <Route path="/gps-map" element={<GPSMapView />} />
            <Route path="*" element={<div className="text-2xl font-bold">Page Not Found</div>} />
          </Routes>
        } />

        <Route path="/location" element={<LocationSelectionPage />} />

        <Route path="*" element={<div className="text-2xl font-bold p-10">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
